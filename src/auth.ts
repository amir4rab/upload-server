import { Request, Response, NextFunction } from 'express';
import 'dotenv/config'

module.exports = () => {
  return ( req: Request, res: Response, next: NextFunction ) => {
    const authKey = req.headers['key'];

    if ( typeof authKey !== 'string' ) {
      console.log('Access denied - No header Keys');
      return res.status(401).send({ error: 'Access denied' });
    }

    const apiKey = process.env.API_KEY;
    if ( typeof apiKey !== 'string' ) {
      console.log('Something went wrong - No Key provided to server');
      return res.status(500).send({ error: 'Something went wrong' })
    }

    if ( apiKey !== authKey ) {
      console.log(`Access denied - Keys does'nt match`);
      return res.status(401).send({ error: 'Access denied' });
    }

    next();
  }
}