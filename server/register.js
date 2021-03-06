// NEED TO REFACTOR AND REFINE
var path = require('path')
var async = require('async')
var _ = require('lodash')
var fs = require('fs')
var chalk = require('chalk')

// backend
var lookDir = path.resolve(__dirname, './modules')
var configs = []
if (!fs.existsSync(lookDir)) {
  console.log('does not existsSync')
}
var data = {}
var exporting = {}
var modules = fs.readdirSync(lookDir)

modules = _.filter(modules, function (n) {
  return !_.startsWith(n, '.')
})
data.modules = modules
_.forEach(data.modules, function (value, key) {
  var obj = {
    'name': value,
    'lookup': lookDir + '/' + value
  }
  var files = fs.readdirSync(lookDir + '/' + value)

  files = _.filter(files, function (n) {
    return !_.startsWith(n, '.')
  })
  obj.files = []
  _.forEach(files, function (f) {
    var fileData = _.words(f, /[^. ]+/g)
    obj.files.push({
      'type': fileData[1],
      'ext': fileData[2],
      'name': fileData[0],
      'orginal': f
    })
  // configs[value].push(f)
  })
  configs.push(obj)
})

// frontend
var frontEndDir = path.resolve(__dirname, '../client/modules')
var frontEndConfigs = []
if (!fs.existsSync(frontEndDir)) {
  console.log('does not existsSync')
}
var frontEnddata = {}
var frontEndexporting = {}
var frontEndmodules = fs.readdirSync(frontEndDir)

frontEndmodules = _.filter(frontEndmodules, function (n) {
  return !_.startsWith(n, '.')
})
var mainFrontendFile = ''
frontEndmodules = _.filter(frontEndmodules, function (n) {
  if (path.extname(n) !== '')mainFrontendFile = n
  return path.extname(n) === ''
})

frontEnddata.modules = frontEndmodules
_.forEach(frontEnddata.modules, function (value, key) {
  var obj = {
    'name': value,
    'lookup': frontEndDir + '/' + value
  }
  var files = fs.readdirSync(frontEndDir + '/' + value)

  files = _.filter(files, function (n) {
    return !_.startsWith(n, '.')
  })
  obj.files = []
  _.forEach(files, function (f) {
    var fileData = _.words(f, /[^. ]+/g)
    obj.files.push({
      'type': fileData[1],
      'ext': fileData[2],
      'name': fileData[0],
      'orginal': f
    })
  // configs[value].push(f)
  })
  frontEndConfigs.push(obj)
})

function Register (app) {
  this.configs = configs
  this.frontEndConfigs = frontEndConfigs
  this.app = app
}
Register.prototype.all = function (meanSettings) {
  function setup () {
    return {
      configs: this.configs,
      frontEndConfigs: this.frontEndConfigs,
      app: this.app,
      meanSettings: meanSettings
    }
  }
  // return functions.query(setup.bind(this))
  return all(setup.bind(this))

}
function all (setup) {
  var settings = setup()
  _.forEach(settings.configs, function (r) {
    var files = {'models': [],'controllers': []}
    _.forEach(r.files, function (j) {
      if (j.type === 'controller') {
        // files.controllers.push(require('./modules/' + r.name + '/' + j.orginal))
      }
      else if (j.type === 'model') {
        files.models.push(require('./modules/' + r.name + '/' + j.orginal))
      }
      else if (j.type === 'routes') {
        settings.app.use('/api/', require('./modules/' + r.name + '/' + j.orginal))
      }
    })
  })

  // frontend
  var frontendFiles = {
    'controller': [],
    'module': [],
    'routes': [],
    'style': [],
    'view': [],
    'config': [],
    'factory': [],
    'service': [],
    'provider': [],
    'else': []
  }
  var frontendFilesFinal = {
    css: [],
    js: []
  }
  _.forEach(settings.frontEndConfigs, function (r) {
    _.forEach(r.files, function (j) {
      if (j.type === 'controller') {
        frontendFiles.controller.push('/modules/' + r.name + '/' + j.orginal)
        frontendFilesFinal.js.push('/modules/' + r.name + '/' + j.orginal)
      }
      else if (j.type === 'module') {
        frontendFiles.module.push('/modules/' + r.name + '/' + j.orginal)
        frontendFilesFinal.js.unshift('/modules/' + r.name + '/' + j.orginal)
      }
      else if (j.type === 'routes') {
        frontendFiles.routes.push('/modules/' + r.name + '/' + j.orginal)
        frontendFilesFinal.js.push('/modules/' + r.name + '/' + j.orginal)
      }
      else if (j.type === 'style') {
        frontendFiles.style.push('/modules/' + r.name + '/' + j.orginal)
        frontendFilesFinal.css.push('/modules/' + r.name + '/' + j.orginal)
      }
      else if (j.type === 'view') {
        // HTML FILES DO NOT NEED TO BE LOADED
        // MAYBE ADDED TO TEMPLATE CACHE
        // frontendFiles.view.push('/modules/' + r.name + '/' + j.orginal)
        // frontendFilesFinal.js.push('/modules/' + r.name + '/' + j.orginal)
      }
      else if (j.type === 'config') {
        frontendFiles.config.push('/modules/' + r.name + '/' + j.orginal)
        frontendFilesFinal.js.push('/modules/' + r.name + '/' + j.orginal)
      }
      else if (j.type === 'factory') {
        frontendFiles.factory.push('/modules/' + r.name + '/' + j.orginal)
        frontendFilesFinal.js.push('/modules/' + r.name + '/' + j.orginal)
      }
      else if (j.type === 'service') {
        frontendFiles.service.push('/modules/' + r.name + '/' + j.orginal)
        frontendFilesFinal.js.push('/modules/' + r.name + '/' + j.orginal)
      }
      else if (j.type === 'provider') {
        frontendFiles.provider.push('/modules/' + r.name + '/' + j.orginal)
        frontendFilesFinal.js.push('/modules/' + r.name + '/' + j.orginal)
      } else {
        frontendFiles.else.push('/modules/' + r.name + '/' + j.orginal)
        frontendFilesFinal.js.push('/modules/' + r.name + '/' + j.orginal)
      }
    })
  })
  frontendFilesFinal.js.unshift(/modules/ + mainFrontendFile)
  _.forEach(settings.meanSettings.assets.css, function (ms) {
    frontendFilesFinal.css.unshift(ms)
  })
  _.forEach(settings.meanSettings.assets.js, function (ms) {
    frontendFilesFinal.js.unshift(ms)
  })
  settings.app.locals.frontendFilesFinal = frontendFilesFinal
}
function register (options) {
  if (options === undefined) {
    return new Register()
  } else {
    return new Register(options)
  }

// if (typeof options === 'object' && options !== null) {
//   return new Register(options)
// }
// throw new TypeError(chalk.red('Expected object for argument options but got ' + chalk.red.underline.bold(options)))
}
module.exports = register
// async.waterfall([
//   function (callback) {
//     fs.readdir(lookDir, function (err, modules) {
//       if (err) {
//         console.log(err)
//       } else {
//         modules = _.filter(modules, function (n) {
//           return !_.startsWith(n, '.')
//         })
//         callback(null, modules)
//       }
//     })
//   },
//   function (modules, callback) {
//     async.forEachOf(modules, function (value, key, callbackForEach) {
//       var obj = {
//         'name': value,
//         'lookup': lookDir + '/' + value
//       }
//       fs.readdir(lookDir + '/' + value, function (err, files) {
//         files = _.filter(files, function (n) {
//           return !_.startsWith(n, '.')
//         })
//         obj.files = []
//         _.forEach(files, function (f) {
//           var fileData = _.words(f, /[^. ]+/g)
//           obj.files.push({
//             'type': fileData[1],
//             'ext': fileData[2],
//             'name': fileData[0],
//             'orginal': f
//           })
//         // configs[value].push(f)
//         })
//         configs.push(obj)
//         if (err) return callbackForEach(err)
//         callbackForEach()
//       })
//     }, function (err) {
//       if (err) console.error(err.message)
//       callback(null, configs)
//     })
//   }
// ], function (err, result) {
//   // module.exports = settings
//   var obj = {}
//   _.forEach(result, function (r) {
//     // console.log('./modules/' + r.name + '/' + r.files[0].orginal)
//     var req = require('./modules/' + r.name + '/' + r.files[0].orginal)
//     // console.log(req)
//     _.forEach(req, function (f, key) {
//       // console.log(f, key)
//       obj[key] = f
//     })
//   // module.exports[r.name] = require(req)
//   })
//   console.log(obj)

// })
