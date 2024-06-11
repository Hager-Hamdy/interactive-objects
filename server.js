require("./db")
const express = require("express")
const interactiveObjectsController = require("./controllers/interactive-objects.controller")
const uploadFileController = require("./controllers/upload-file")
const typesController = require("./controllers/new-io-types.controller")
const pagesController = require("./controllers/book-pages.controller")

const bodyparser = require("body-parser")
const cors = require("cors")
const swaggerJsDoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")
let app = express()

// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Question Manager APIs.",
    },
    schemes: [process.env.SWAGGER_SCHEME],
    host: process.env.SWAGGER_HOST,
    basePath: "/api",
    
  },

  apis: [
    "controllers/interactive-objects.controller.js",
  ],
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs))

app.use(cors())
app.use('/uploads', express.static('uploads'))
app.use('/templates', express.static('templates'))

app.use(
  bodyparser.urlencoded({
    extended: true,
  })
)

app.use(bodyparser.json())


const port = process.env.PORT || 4000

app.listen(port, () => {
  console.log(`App is listening to ${port} ....`)
})

app.use("/api", [
  interactiveObjectsController,
  typesController,
  pagesController,
  uploadFileController,
])
