import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../db/client';
import { authOptions } from '../auth/[...nextauth]';
import { unstable_getServerSession } from 'next-auth/next';

const index = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await unstable_getServerSession(req, res, authOptions);
  const email: any = session?.user?.email;
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
  }
  const parseBody = JSON.parse(req.body);
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    const shortLink = { ...parseBody, userId: user?.id };
    const savedShortLink = await prisma.shortlinks.create({ data: shortLink });
    res.status(200).json(savedShortLink);
  } catch (err) {
    res.status(400).json({ message: 'Something went wrong' });
  }
};
export default index;
