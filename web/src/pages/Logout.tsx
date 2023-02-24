import { STORAGE_ACCESS_TOKEN_KEY, STORAGE_REFRESH_TOKEN_KEY } from "@/constants";
import { useLocalStorageState } from "ahooks";
import { Button } from "antd";

const Logout = () => {
    const [, setAccessToken] = useLocalStorageState<string>(STORAGE_ACCESS_TOKEN_KEY, {
        defaultValue: '',
      });
      const [, setRefreshToken] = useLocalStorageState<string>(STORAGE_REFRESH_TOKEN_KEY, {
        defaultValue: '',
      });
    return <>
        <Button onClick={() => {
            setAccessToken('')
            setRefreshToken('')
            window.location.reload()
        }}>Logout</Button>
    </>;
}
 
export default Logout;