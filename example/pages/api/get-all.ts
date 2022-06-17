import type { NextApiRequest, NextApiResponse } from 'next';

import fetch from 'node-fetch';

type Data = {
  error: string | null;
  successful: boolean;
  files: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const apiRes = await fetch(
      process.env.UPLOAD_API as string,
      {
        headers: {
          'key': process.env.API_KEY as string
        },
      }
    );
    const json = await apiRes.json();
    const { files } = json as { files: string[] | null | undefined };
  
    if ( files === null || typeof files === 'undefined' ) return res.status(500).json({ successful: false, error: 'Something went wrong', files: [] });
    
    const serverURl = 
      typeof process.env.FILE_SERVER_URL !== 'undefined' ? 
      process.env.FILE_SERVER_URL + '/assets/' :
      'http://localhost:6060/assets/';
    
    const mappedItems = files.map(i => serverURl + i);

    return res.status(200).json({ successful: true, error: null, files: mappedItems })
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ successful: false, error: 'Something went wrong', files: [] })
  }
}