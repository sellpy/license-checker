# License checker

This action extracts licence information for all installed packages. It is configurable to exclude all indirect dependencies as well as excluding by name prefix.

## Usage

### `workflow.yml` Example

Place in a `.yml` file such as this one in your `.github/workflows` folder. [Refer to the documentation on workflow YAML syntax here.](https://help.github.com/en/articles/workflow-syntax-for-github-actions)

```yaml
name: Upload to S3

on: [pull_request]

jobs:
  upload:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
      - uses: sellpy/license-checker@main
        with:
          exclude_prefix: '@sellpy'
          output_file_path: 'packages-license-data.json'
```
## Action inputs

| Name                       | Required | Default value                | Description |
|----------------------------|----------|------------------------------|-------------|
| `exclude_prefix`           | -        | -                            | Exclude packages from license check by giving a prefix. |
| `direct_dependencies_only` | -        | `false`                      | Only include direct dependencies. |
| `omit_package_versions`    | -        | `false`                      | Omit package versions in output. |
| `output_file_path`         | -        | "packages-license-info.json" | Path to output file (needs to use file extension .json). |
