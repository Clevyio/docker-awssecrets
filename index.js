const AWS = require("aws-sdk");
const argv = require("minimist")(process.argv.slice(2));

const { secret, region = "eu-west-1" } = argv;

const SecretId = secret;

const client = new AWS.SecretsManager({ region });

if (!secret) {
  console.log("Missing SECRET_NAME or SECRET_ARN");
  process.exit(1);
}

client.getSecretValue({ SecretId }, (err, data) => {
  if (err) {
    console.log(`${err.name}: ${err.message}`);
    process.exit(1);
  }

  if ("SecretString" in data) {
    try {
      const secrets = JSON.parse(data.SecretString);
      const keys = Object.keys(secrets);
      keys.forEach(k => {
        console.log(`${k}=${secrets[k]}`);
      });
    }
    catch (e) {
      console.log(data.SecretString);
    }
  }

  // secret is a binary
  else {
    let buff = new Buffer(data.SecretBinary, "base64");
    console.log(buff.toString("ascii"));
  }
});
