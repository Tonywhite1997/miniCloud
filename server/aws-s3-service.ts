const uuid = require("uuid").v4;
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

exports.S3Upload = async (file) => {
  const Key = `upload/${uuid()}-${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key,
    ContentType: file.mimetype,
    Body: file.buffer,
  };
  const putObject = new PutObjectCommand(params);
  await s3.send(putObject);

  const objectURL = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${params.Key}`;

  return {
    Location: objectURL,
    Key: params.Key,
  };
};

exports.S3Download = async (objectKey: string) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: objectKey,
  };
  try {
    const getObject = new GetObjectCommand(params);
    const response = await s3.send(getObject);
    return response.Body;
  } catch (error) {
    console.log(error);
  }
};

exports.S3DeleteObject = async (objectKey: string) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: objectKey,
  };
  const deleteObject = new DeleteObjectCommand(params);
  return await s3.send(deleteObject);
};

exports.S3DeleteMultipleObjects = async (keys: [string]) => {
  const objectKeys = keys.map((objKey: string) => {
    return { Key: objKey };
  });
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Delete: {
      Objects: objectKeys,
    },
  };
  const deleteMultipleObjects = new DeleteObjectsCommand(params);
  try {
    return await s3.send(deleteMultipleObjects);
  } catch (error) {
    return console.error(error);
  }
};
