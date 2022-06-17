import type { NextApiRequest, NextApiResponse } from 'next'

import formidable, { IncomingForm } from 'formidable'
import fetch, { FormData, blobFromSync } from 'node-fetch';

type Data = {
  err: null | string;
  successful: boolean;
  form: FormData | null;
}

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const form = new IncomingForm();

  let successful = true;
  const formData = new FormData();

  form.parse(req, async ( err, fields, files ) => {
    if (err) {
      successful = false;
      return;
    }
    
    Object.keys(files).forEach(i => {
      const file = files[+i] as formidable.File;
      const data = blobFromSync(file.filepath);
      
      if ( file.originalFilename !== null ) formData.append( i, data, file.originalFilename );
    })

    if ( !successful ) return res.status(500).json({ err: 'Something went wrong 0', successful: false, form: formData });

    try {
      const uploadServerRes = await fetch(
        process.env.UPLOAD_API as string,
        {
          method: 'POST',
          headers: {
            'key': process.env.API_KEY as string
          },
          body: formData
        }
      );
      const uploadServerJson = await uploadServerRes.json() as { successful: boolean, error: string | null };
    
      if ( uploadServerJson.successful ) {
        return res.status(200).json({ err: null, successful: true, form: formData })
      } else {
        return res.status(500).json({ err: uploadServerJson.error, successful: false, form: formData })
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ err: 'something went wrong', successful: false, form: formData })
    }
  })
}
