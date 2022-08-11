import {
  Center,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { Shortlinks } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { FC } from 'react';

interface ShortlinksListProps {
  shortlinks: Shortlinks[];
}
const ShortlinksList: FC<ShortlinksListProps> = ({ shortlinks }) => {
  const url = 'reqq.cc';
  const { status } = useSession();

  if (status === 'authenticated' && shortlinks.length !== 0) {
    return (
      <Center>
        <TableContainer mt={5} width="50%">
          <Table variant="simple">
            {/* <TableCaption>caption</TableCaption> */}
            <Thead>
              <Tr>
                <Th>Short link</Th>
                <Th>URL</Th>
              </Tr>
            </Thead>
            <Tbody>
              {shortlinks.map((shortlink) => (
                <Tr key={shortlink.slug}>
                  <Td>
                    <Text>{`${url}${shortlink.slug}`}</Text>
                  </Td>
                  <Td>
                    <Text>{shortlink.url}</Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Center>
    );
  } else {
    return null;
  }
};

export default ShortlinksList;
