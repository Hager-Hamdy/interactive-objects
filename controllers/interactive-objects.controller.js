require("dotenv").config();
const express = require("express");
let router = express.Router();
let mongoose = require("mongoose");
let interactiveObjectSchema =
  require("../models/interactive-object.model").interactiveObjectSchema;
// let InteractiveObjectTypeSchema = require("../models/object-types.model").InteractiveObjectTypeSchema;
let IOTypeSchema = require("../models/object-types.model").IOTypeSchema;
const fs = require("fs")
const path = require("path")
const request = require("request")

router.get("/interactive-objects", async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  delete req.query.page;
  delete req.query.limit;
  for await (let item of ["object", "domainName", "subDomainName"])
    if (req.query[item]) {
      const searchValue = req.query[item];
      req.query[item] = { $regex: new RegExp(searchValue), $options: "i" };
    }
  const data = await interactiveObjectSchema.paginate(req.query, {
    page,
    limit,
    sort: { updatedAt: "desc" },
  });
  res.json(data);
});

router.post("/interactive-objects", async (req, res) => {
  const newObj = new interactiveObjectSchema({ _id: false });
  newObj.objId = new mongoose.Types.ObjectId();

  for (let key in req.body) {
    if (Object.hasOwnProperty.bind(req.body)(key)) {
      if (key === "parameters" && typeof req.body[key] === "string")
        newObj[key] = JSON.parse(req.body[key]);
      else newObj[key] = req.body[key];
    }
  }
  newObj.save(async (err, doc) => {
    if (!err) {
      if (req.body.objectElements) {
          doc.parameters = await saveObject(req.body.type, req.body.objectElements)
        
          interactiveObjectSchema.updateOne(
            { _id: doc._id },
            {
              $set: doc,
            },
            { new: false, runValidators: true, returnNewDocument: true, upsert: true },
            (err, doc) => {
              if (err) console.log(err)
            }
          );
      }
      res.status(200).json(newObj.objId);
      await createObject(newObj.objId)

    } else {
      console.log(err);
      res.status(406).json(`Not Acceptable: ${err}`);
    }
  });
});

router.get("/interactive-objects/:id", async (req, res) => {
  let obj = await interactiveObjectSchema.findById(req.params.id);
  console.log(obj.h5pString)
  res.status(200).json(obj);
});

router.patch("/interactive-objects/:id", (req, res) => {
  const id = req.params.id;
  const obj = { _id: id };
  for (let key in req.body) {
    if (req.body.hasOwnProperty(key)) {
      if (key === "parameters" && typeof req.body[key] === "string")
        obj[key] = JSON.parse(req.body[key]);
      else obj[key] = req.body[key];
    }
  }

  obj.updatedAt = Date.now();
  interactiveObjectSchema.updateOne(
    { _id: id },
    {
      $set: obj,
    },
    { new: false, runValidators: true, returnNewDocument: true, upsert: true },
    (err, doc) => {
      if (!err) {
        res.status(200).json(obj);
      } else {
        res.status(500).json(err);
      }
    }
  );
});
router.delete("/interactive-objects/:id", async (req, res) => {
  interactiveObjectSchema
    .findByIdAndRemove(req.params.id)
    .then((doc) => {
      res.status(200).json("Object deleted successfully.");
    })
    .catch((err) => {
      res.status(500).json(`Can't delete object: ${err}`);
    });
});

// router.get("/createObject/:id", async (req, res) => {
//   // get object
//   console.log('createObject');
//   let obj = await interactiveObjectSchema.findById(req.params.id);
//   const { type, h5pString, questionName,  } = obj;
//   let typeData = await InteractiveObjectTypeSchema.find({ typeName: type });
//   const { templateJson, templateUrl } = typeData[0]
//   console.log(templateUrl, templateJson);
//   request.get(templateUrl, function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//         var html = body;
//         for (let key in templateJson) {
//           let replacedText = JSON.stringify(templateJson[key])
//           replacedText = replacedText.substring(1, replacedText.length-1)
//           let newText = JSON.stringify(h5pString[key])
//           newText = newText.substring(1, newText.length-1)
//           html = html.replace(replacedText, newText);
//         }
//         const outputPath = path.join(`${__dirname}/../uploads/${questionName}.html`)
//           fs.writeFileSync(outputPath, html)
//           res.send(`${process.env.APP_URL}/uploads/${questionName}.html`);
//     } else console.log(error)
// });
// });

router.post("/saveObject/:id", async (req, res) => {
  const { objectElements } = req.body
  let obj = await interactiveObjectSchema.findById(req.params.id);

  const { type } = obj;

  let typeData = await InteractiveObjectTypeSchema.find({ typeName: type });
  let { abstractParameter } = typeData[0]
  let i = 0
  for await (let ele of objectElements) {
    let key = Object.keys(ele)[0]
    if (abstractParameter[key]) {
      abstractParameter[key] = ele[key]
      objectElements.splice(i, 1);
    }
    i++
  }
  if (objectElements.length) {
    const abstractKeys = Object.keys(abstractParameter)

    for await (let key of abstractKeys) {
      if (Array.isArray(abstractParameter[key])) {
        const mainKey = Object.keys(abstractParameter[key][0])[0]
        const parameters = []
        objectElements.map(item => {
          let key = Object.keys(item)[0]
          if (key === mainKey) {
            parameters.push({ [mainKey]: item[key] })
          } else parameters[parameters.length - 1][key] = item[key]
        })
        abstractParameter[key] = parameters
      }
    }
  }
  obj.parameters = abstractParameter
  obj.updatedAt = Date.now();
  interactiveObjectSchema.updateOne(
    { _id: req.params.id },
    {
      $set: obj,
    },
    { new: false, runValidators: true, returnNewDocument: true, upsert: true },
    (err, doc) => {
      if (!err) {
        res.status(200).json(obj);
      } else {
        res.status(500).json(err);
      }
    }
  );
});


router.get("/createObject/:id", async (req, res) => {
  let obj = await interactiveObjectSchema.findById(req.params.id);
  const { type, parameters, questionName } = obj;

  let typeData = await InteractiveObjectTypeSchema.find({ typeName: type });
  let { templateUrl, repeatedString, htmlseparator } = typeData[0]

  request.get(templateUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var html = body;
      for (const [key, value] of Object.entries(parameters)) {
        if (typeof value === 'string') {
          html = html.replace(key, value);
        } else if (Array.isArray(value)) {
          let objRepeatedString = ''
          for (const item of value) {
            let itemHtml = JSON.parse(JSON.stringify(repeatedString))
            for (const [_key, _value] of Object.entries(item)) {
              if ([true, false].includes(_value)) {
                itemHtml = itemHtml.replace(`\"${_key}\":true`, `\"${_key}\":${_value}`)
                itemHtml = itemHtml.replace(`\"${_key}\":false`, `\"${_key}\":${_value}`)
                //console.log(itemHtml)
              } else {
                itemHtml = itemHtml.replace(_key, _value)
              }
            }
            objRepeatedString += itemHtml + htmlseparator
          }
          repeatedString = JSON.stringify(repeatedString)
          repeatedString = repeatedString.substring(1, repeatedString.length - 1)
          objRepeatedString = JSON.stringify(objRepeatedString)
          objRepeatedString = objRepeatedString.substring(1, objRepeatedString.length - (htmlseparator.length + 1))
          objRepeatedString = objRepeatedString.split(",")
          // replace all text include _ need check
          objRepeatedString = objRepeatedString.map(item => item.replace(/<(.*)>_(.*)_<\/(.*)>/g, ""))
          objRepeatedString = objRepeatedString.join(",")

          html = html.replace(repeatedString, objRepeatedString)
        }
      }
      const outputPath = path.join(`${__dirname}/../uploads/${questionName}.html`)
      fs.writeFileSync(outputPath, html)
      res.send(`${process.env.APP_URL}/uploads/${questionName}.html`);
    } else console.log(error)
  });


});

const saveObject = async (type, objectElements) => {

  let typeData = await IOTypeSchema.find({ typeName: type });
  let { abstractParameter } = typeData[0]
  let i = 0
  for await (let ele of objectElements) {
    let key = Object.keys(ele)[0]
    key = key.replace(/\*/g, "").replace(/\#/g, "")
    if (abstractParameter[key]) {
      abstractParameter[key] = ele[key]
      objectElements.splice(i, 1);
    }
    i++
  }
  if (objectElements.length) {
    const abstractKeys = Object.keys(abstractParameter)

    for await (let key of abstractKeys) {
      key = key.replace(/\*/g, "").replace(/\#/g, "")
      if (Array.isArray(abstractParameter[key])) {
        let mainKey = Object.keys(abstractParameter[key][0])[0]
        mainKey = mainKey.replace(/\*/g, "").replace(/\#/g, "")

        const parameters = []
        objectElements.map(item => {
          let key = Object.keys(item)[0]
          key = key.replace(/\*/g, "").replace(/\#/g, "")
          if (key === mainKey) {
            parameters.push({ [mainKey]: item[key] })
          } else parameters[parameters.length - 1][key] = item[key]
        })
        abstractParameter[key] = parameters
      }
    }
  }
  return abstractParameter
}

const createObject = async (id) => {
  let obj = await interactiveObjectSchema.findById(id);
  const { type, parameters, questionName } = obj;

  let typeData = await IOTypeSchema.find({ typeName: type });
  let { templateId, repeatedString, repeated2, repeated3, htmlSeparator, category, originalJson, modifiedJson } = typeData[0]
  const decodedTempalteId = JSON.parse(atob(templateId));
  let templateUrl
  await request.get("http://34.246.140.123:4000/api/los/" + decodedTempalteId.id, async function (error, response, body) {
    await request.get("http://34.246.140.123:4000/api/signedurl?url=" + body.url, function (error, response, body2) {
      templateUrl = body2.LOPreSignedURL
    })
  })

  modifiedJson = JSON.stringify(modifiedJson)
  modifiedJson = modifiedJson.substring(1, modifiedJson.length - 1)
  obj.questionOrExplanation = category
  // const arrayParameters = Object.entries(parameters).map(item => Array.isArray(item[1]))
  return request.get(templateUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var html = body;
      for (const [key, value] of Object.entries(parameters)) {
        if (typeof value === 'string') {
          // html = html.replace(key, value);
          modifiedJson = modifiedJson.replace(key, value);
          //       console.log(modifiedJson)
        } else if (Array.isArray(value)) {
          let objRepeatedString = ''
          for (const item of value) {
            let itemHtml = JSON.parse(JSON.stringify(repeatedString))
            for (const [_key, _value] of Object.entries(item)) {
              // if ([true, false].includes(_value)) {
              //   itemHtml = itemHtml.replace(`\"${_key}\":true`, `\"${_key}\":${_value}`)
              //   itemHtml = itemHtml.replace(`\"${_key}\":false`, `\"${_key}\":${_value}`)
              // } else {
              itemHtml = itemHtml.replace(_key, _value)
              //  }
            }
            objRepeatedString += itemHtml + htmlSeparator
          }
          repeatedString = JSON.stringify(repeatedString)
          repeatedString = repeatedString.substring(1, repeatedString.length - 1)
          objRepeatedString = JSON.stringify(objRepeatedString)
          objRepeatedString = objRepeatedString.substring(1, objRepeatedString.length - (htmlSeparator.length + 1))
          objRepeatedString = objRepeatedString.split(",")
          objRepeatedString = objRepeatedString.map(item => item.replace(/<(.*)>_(.*)_<\/(.*)>/g, ""))

          objRepeatedString = objRepeatedString.join(",")

          modifiedJson = modifiedJson.replace(repeatedString, objRepeatedString)
        }
      }
      originalJson = JSON.stringify(originalJson)
      originalJson = originalJson.substring(1, originalJson.length - 1)
      html = html.replace(originalJson, modifiedJson)
      const outputPath = path.join(`${__dirname}/../uploads/${questionName}.html`)
      fs.writeFileSync(outputPath, html)
      obj.url = `${process.env.APP_URL}/uploads/${questionName}.html`
      obj.updatedAt = Date.now();
      interactiveObjectSchema.updateOne(
        { _id: id },
        {
          $set: obj,
        },
        { new: false, runValidators: true, returnNewDocument: true, upsert: true },
        (err, doc) => {
          if (err) console.log(err)
        }
      );
    } else console.log(error)
  });
}


module.exports = router;
