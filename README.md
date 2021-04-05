# API CHINCHIN

## Proyecto desarrollado en ExpressJs. Requiere de [node JS](https://nodejs.org/es/download/) para poder iniciar

## Siga los siguientes pasos para iniciar el proyecto

1. Instale las dependencias con el comando:

>`npm i`

ó en caso de tener instalado [yarn](https://yarnpkg.com/):

>`yarn`

2. Inicie el servidor con el comando:

>`node server`

## Hay dos formas de consumir la API:

1. A través del link <http://localhost:3000> se retornará un JSON con el equivalente de la unidad de cada moneda (BTC, ETH, DASH, EUR, PTR y VEF) en USD.
2. A través del link <http://localhost:3000?usd=amount> (donde **amount** debe ser reemplazado por un número mayor a 0)
