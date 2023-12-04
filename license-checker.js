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

const directDependencies = [...Object.keys(packageJSON.dependencies), ...Object.keys(packageJSON.devDependencies)]

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
  let packageNames = Object.keys(packages)
  if (EXCLUDE_PREFIX) {
    packageNames = packageNames.filter((packageName) => !packageName.startsWith(EXCLUDE_PREFIX))
    githubActions.info(`Excluding packages with prefix "${EXCLUDE_PREFIX}". ${packageNames.length} packages remaining.`)
  }
  if (DIRECT_DEPENDENCIES_ONLY) {
    packageNames = packageNames.filter((packageName) => directDependencies.includes(stripPackageVersion(packageName)))
    githubActions.info(`Only including direct dependencies. ${packageNames.length} packages remaining.`, )
  }
  const licenceInfo = packageNames.reduce((filteredPackages, packageName) => {
      const outputPackageName = OMIT_PACKAGE_VERSIONS ? stripPackageVersion(packageName) : packageName
      filteredPackages[outputPackageName] = packages[packageName]
      return filteredPackages
    }, {})
  githubActions.info(`Compiled package licence data for ${Object.keys(licenceInfo).length} packages`)
  githubActions.info('Writing packages license data to ' + OUTPUT_FILE_PATH)
  fs.writeFileSync(
    OUTPUT_FILE_PATH,
    JSON.stringify(licenceInfo, null, 2)
  )
  githubActions.setOutput('packages_license_data_file_path', OUTPUT_FILE_PATH);
})
.catch((error) => {
  githubActions.setFailed(error.message)
})

