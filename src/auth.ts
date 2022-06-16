import { Request, Response, NextFunction } from 'express';
import 'dotenv/config'

module.exports = () => {
  return ( req: Request, res: Response, next: NextFunction ) => {
    const authKey = req.headers['key'];

    if ( typeof authKey !== 'string' ) {
      return res.status(401).send({ error: 'Access denied' });
    }

    const apiKey = process.env.API_KEY;
    if ( typeof apiKey !== 'string' ) {
      return res.status(500).send({ error: 'Something went wrong' })
    }

    if ( apiKey !== authKey ) {
      return res.status(401).send({ error: 'Access denied' });
    }

    next();
  }
}