//* Express
import express from 'express';
import type { Request, Response } from 'express';

//* Express middleware
import fileUpload from 'express-fileupload';
import cors from 'cors';
const auth = require('./auth');

//* Utils
import { v4 as uuid } from 'uuid';
import 'dotenv/config';

//* Node
import path from 'path';
import fs from 'fs';

//* Global constants
const app = express();
const port = process.env.PORT || 6060;
const acceptedFilesFormats = process.env.ACCEPTED_FILES_FORMATS?.split('_') || [
  '.png', '.jpg', '.svg'
]
const imagesFolder = 'assets';
const staticFolderPath = path.resolve(__dirname + '/../static' );


//* Checking for static folder and creating it
if ( !fs.existsSync(staticFolderPath) ) fs.mkdirSync(staticFolderPath);

//* Checking for assets folder and creating it
if ( !fs.existsSync(staticFolderPath + '/' + imagesFolder) ) fs.mkdirSync(staticFolderPath + '/' + imagesFolder); 

//* Middle wares
app.use(express.json());
app.use(express.static(staticFolderPath));
app.use( cors({
  origin: '*'
}) );
app.use(auth());
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  useTempFiles : true,
  tempFileDir : '/tmp/'
}));

//* Deleting one file
app.delete('/', async (req: Request, res: Response) => {
  const { body } = req;
  
  // verifying file name existence
  const file = body.file;
  if ( typeof file !== 'string' ) {
    return res.status(400).send({ successful: false, error: 'No file name has been sended!' });
  }
  
  // verifying file name
  const regex = new RegExp(/^([a-z0-9-]+).([a-z0-9]+)$/);
  if ( !regex.test(file) ) {
    return res.status(400).send({ successful: false, error: 'File name is invalid!' });
  }

  try {
    const pathToFile = path.resolve(staticFolderPath, 'assets', file);
    fs.rmSync(pathToFile);
    res.status(200).json({ successful: true, error: null });
  } catch(err) {
    console.error(err);
    res.status(200).json({ successful: false, error: `File does'nt exists` });
  }
});

//* Deleting all files
app.delete('/delete-all', async (req: Request, res: Response) => {
  try {
    // Generating files path
    const filesPath = path.resolve( staticFolderPath, imagesFolder )

    // reading files
    const files = fs.readdirSync(filesPath);

    // removing each file
    files.forEach(fileName => {
      fs.rmSync(path.resolve( staticFolderPath, imagesFolder, fileName ))
    })

    res.status(200).json({ err: null, successful: true });

  } catch(err) {
    console.error(err);
    res.status(500).json({ err: 'something went wrong', successful: false })
  }
})

//* Adding files
app.post('/', async (req: Request, res:Response) => {
  // extracting file
  if ( !req.files || Object.keys(req.files).length === 0 ){
    return res.status(400).send({ successful: false, error: 'No files has been sended!', file: null });
  }
  const fileNames : string[] = [];
  
  let errInFileParsing : 
    {
      error: string,
      status: number
    } | null 
    = null; 

  Object.keys(req.files).forEach( fileKey => {

    // extracting files from uploaded files
    // const firstFileKey = Object.keys(req.files)[0];
    const file = req.files![fileKey] as fileUpload.UploadedFile;

    // extracting file format from file name
    const fileFormat = file.name.slice(file.name.lastIndexOf('.'));
  
    // verifying files format 
    if ( !acceptedFilesFormats.includes(fileFormat) ) {
      console.log('False files');
      return errInFileParsing = { error: `${fileFormat} is not supported`, status: 400 };
    }

    // generating random name for file
    const fileUuid = uuid();
    const fileNameOnServer = fileUuid + fileFormat;
    fileNames.push(fileNameOnServer);
  
    // generating path for file storing
    const resolvedPath = path.resolve(staticFolderPath, imagesFolder, fileNameOnServer);
  
    // moving file to the correct storage
    file.mv(resolvedPath, (err) => {
      if ( err ) {
        console.error(`error`, JSON.stringify(err));
        return errInFileParsing = { error: `Something went wrong!`, status: 400 };
      }
    })
  })

  // ending the handler in case of any error
  if ( errInFileParsing !== null ) {
    const { status, error } = errInFileParsing;
    return res.status(status).json({ successful: false, error, file: null })
  }
  
  res.status(200).json({ successful: true, error: null, file: fileNames });
})

//* Returning all of files
app.get('/', async (req: Request, res: Response) => {
  try {
    // Generating files path
    const filesPath = path.resolve( staticFolderPath, imagesFolder )

    // reading files
    const files = fs.readdirSync(filesPath);

    // sending files to user
    res.status(200).send({
      files,
    })
  } catch (err) {
    console.error(err);
    res.status(200).send({
      files: []
    })
  }
});

app.listen(port, () => {
  console.log(`Application started at http://localhost:${port}`);
})