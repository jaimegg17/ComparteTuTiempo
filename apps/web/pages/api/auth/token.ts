import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessToken } from '@auth0/nextjs-auth0';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { accessToken } = await getAccessToken(req, res);
    
    if (!accessToken) {
      return res.status(401).json({ error: 'No access token available' });
    }

    return res.status(200).json({ accessToken });
  } catch (error: any) {
    console.error('Error getting access token:', error);
    return res.status(error.status || 500).json({ 
      error: error.message || 'Failed to get access token' 
    });
  }
}

