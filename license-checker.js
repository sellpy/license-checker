const fs = require('fs')
const githubActions = require('@actions/core')
const path = require('path')
const checker = require('license-checker-rseidelsohn')
const packageJSON = require(path.join(process.cwd(), 'package.json'))

const EXCLUDE_PREFIX = githubActions.getInput('exclude_prefix', {
  required: false,
})

const DIRECT_DEPENDENCIES_ONLY = githubActions.getInput('direct_dependencies_only', {
  required: false,
})

const OMIT_PACKAGE_VERSIONS = githubActions.getInput('omit_package_versions', {
  required: false,
})

const OUTPUT_FILE_PATH = githubActions.getInput('output_file_path', {
  required: false,
})

githubActions.info('Exclude prefix: ' + EXCLUDE_PREFIX)

const directDependencies = DIRECT_DEPENDENCIES_ONLY ? [...Object.keys(packageJSON.dependencies), ...Object.keys(packageJSON.devDependencies)] : null

const getLicenses = () =>
  new Promise((resolve, reject) => {
    checker.init(
      {
        start: process.cwd(),
      },
      (err, packages) => {
        if (err) {
          reject(err)
        } else {
          resolve(packages)
        }
      }
    )
  })

const stripPackageVersion = (packageName) => packageName.replace(/@\d+\.\d+\.\d+/, '')

getLicenses().then((packages) => {
  githubActions.info(`Extracted license data for ${Object.keys(packages).length} packages`)
  const licenceInfo = Object.keys(packages)
    .filter((packageName) => EXCLUDE_PREFIX ? !packageName.startsWith(EXCLUDE_PREFIX) : true)
    .filter((packageName) => directDependencies ? directDependencies.includes(stripPackageVersion(packageName)) : true)
    .reduce((filteredPackages, packageName) => {
      packageName = OMIT_PACKAGE_VERSIONS ? stripPackageVersion(packageName) : packageName
      filteredPackages[packageName] = packages[packageName]
      return filteredPackages
    }, {})
  githubActions.info(Object.keys(licenceInfo).length + ' packages with extracted data')
  githubActions.info('Writing license data to ' + OUTPUT_FILE_PATH)
  fs.writeFileSync(
    OUTPUT_FILE_PATH,
    JSON.stringify(licenceInfo, null, 2)
  )
  githubActions.setOutput('packages_license_data_file_path', OUTPUT_FILE_PATH);
})
.catch((error) => {
  githubActions.setFailed(error.message)
})

