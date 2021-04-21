import express from 'express'
import env from 'dotenv'
import axios from 'axios'

env.config()

const app = express()

const optionsExchange = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 20,
  style: 'currency',
  currency: 'USD'
}

const optionsCurrency = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 20
}

app.get('/', async (req, res) => {
  try {
    const { usd } = req.query

    if (!!usd && isNaN(usd)) throw new Error('Debe pasar un número como parámetro')
    if (!!usd && usd <= 0) throw new Error('El número debe ser mayor a 0')

    const exchange = []
    let vef = +process.env.VEF
    let ptr = +process.env.PTR

    const [response1, response2] = await Promise.all([
      axios.get('/cryptocurrency/listings/latest', {
        baseURL: 'https://pro-api.coinmarketcap.com/v1',
        headers: {
          'X-CMC_PRO_API_KEY': process.env.APIKEY,
          'Content-Type': 'application/json'
        },
        data: {
          'start': '1',
          'limit': '5000',
          'convert': 'USD'
        }
      }),
      axios.get(`/latest?access_key=${process.env.EXCHANGERATEAPIKEY}`, {
        baseURL: 'http://api.exchangeratesapi.io/v1'
      })
    ])

    const cryptocurrencies = response1.data.data.filter(currency => !!currency.symbol.match(/^BTC$|^ETH$|^DASH$/g))
    cryptocurrencies.forEach(currency => {
      if (!!usd)
        exchange.push({
          currency: currency.name,
          [`exchangeTo${currency.symbol}`]: +usd / currency.quote.USD.price,
          formated: (+usd / currency.quote.USD.price).toLocaleString('es-ES', optionsCurrency)
        })
      else exchange.push({
        currency: currency.name,
        priceInUSD: currency.quote.USD.price,
        formated: (currency.quote.USD.price).toLocaleString('es-ES', optionsExchange)
      })
    })

    const eur = response2.data.rates.USD

    if (!!usd) {
      exchange.push({
        currency: 'EURO',
        exchangeToEUR: +usd / eur,
        formated: (+usd / eur).toLocaleString('es-ES', optionsCurrency)
      })
    } else {
      exchange.push({
        currency: 'EURO',
        priceInUSD: eur,
        formated: (eur).toLocaleString('es-ES', optionsExchange)
      })
    }

    try {
      const response3 = await Promise.race([
        axios.post(
          '/price',
          {
            coins: ['USD', 'PTR'],
            fiats: ['Bs']
          },
          {
            baseURL: 'https://petroapp-price.petro.gob.ve',
            headers: {
              'Content-Type': 'application/json'
            }
          }),
        new Promise((_, reject) => setTimeout(
          () => reject(new Error('Timeout')), 6000
        ))
      ])

      vef = response3.data.data.USD.BS
      ptr = response3.data.data.PTR.BS / vef
    } catch (err) {
      console.error(err.message)
    }

    exchange.push({
      currency: 'Petros',
      [!!usd ? 'exchangeToPTR' : 'priceInUSD']: !!usd ? +usd * ptr : 1 / ptr,
      formated: (!!usd ? +usd * ptr : 1 / ptr).toLocaleString('es-ES', optionsCurrency)
    })
    exchange.push({
      currency: 'Bolívares Venezolanos',
      [!!usd ? 'exchangeToVEF' : 'priceInUSD']: !!usd ? +usd * vef : 1 / vef,
      formated: (!!usd ? +usd * vef : 1 / vef).toLocaleString('es-ES', optionsCurrency)
    })

    return res.send(exchange)
  } catch (err) {
    console.log(err)
    res.status(500).send({
      error: err.message
    })
  }
})

app.listen(process.env.PORT, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`),
)