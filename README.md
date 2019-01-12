# Docker AWS Secrets

Thin docker wrapper around AWS Secrets Manager. Will simply output the requested secrets to console.  
Useful for loading secrets in a env file or exporting in the environment, for example in CI stages.

This will try to retrieve permission from its environment, so either a resource role or user credentials with `secretsmanager:GetSecretValue` permissions are required.

## Example: Gitlab CI

This project was made to help centralize secrets management within a gitlab instance across multiple projects. For example, we need to publish private npm packages from multiple repositories. This makes storing and managing npm tokens very complex, and introduces the security risk of not rotating the token often enough (when an employee leaves, or if our CI token gets leaked somehow), or of course to break builds if we revoke a token and forget to update it in one of our repositories.

With [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/?nc1=h_ls), we can setup automatic rotation of our npm token across all repositories without worrying about it.

Here is what a `.gitlab-ci.yml` could look like:

```
stages:
  - secrets
  - deploy

secrets:
  stage: secrets
  image:
    name: clevy/awssecrets
    entrypoint: [""]
  script:
    - awssecrets --region eu-west-1 --secret my-secrets > .ci-secrets
  artifacts:
    # you want to set this to a value high enough to be used in all your stages,
    # but low enough that it gets invalidated quickly and needs to be regenerated later
    expire_in: 30 min 
    paths:
      # this will be available by default in all the next stages
      - .ci-secrets

release:
  stage: deploy
  image: node
  before_script:
    # you can import the content of the secrets file in your environment like so
    - export $(cat .ci-secrets | xargs)
    - echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" >> ~/.npmrc
  script:
    - npm install -q
    - npm publish

```

In our case, our gitlab runner instance is setup with an AWS role attached to it, so we don't need to pass AWS credentials. See usage below for more detailed instructions.

## Basic usage

```
$ docker run \
  -e AWS_SECRET_ACCESS_KEY \
  -e AWS_ACCESS_KEY_ID \
  clevy/awssecrets --region eu-west-1 --secret nameOfSecret

SUPER_SECRET=toto
ULTRA_SECRET=tata
VERY_VERY_SECRET=poepoe
```

### Arguments

```
mandatory:
--region (default: `eu-west-1`): region in which the secret is stored
--secret (default: none): name or ARN of secret to retrieve

optional:
--AWS_ACCESS_KEY_ID (default: from environment)
--AWS_SECRET_ACCESS_KEY (default: from environment)
```
