import { DesignService, Design } from "./design.service";
import { tokenManager } from "@/lib/token";

jest.spyOn(tokenManager, 'getRefreshToken').mockReturnValue('fake-refresh-token');

test('calls client API and logs the response', async () => {
  const {data} = await DesignService.getAllDesigns('6852ad075f27723b46b7cbdb');
  
  console.log(data);
});