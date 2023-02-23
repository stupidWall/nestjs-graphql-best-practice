import { STORAGE_ACCESS_TOKEN_KEY, STORAGE_REFRESH_TOKEN_KEY } from "@/constants";
import { useLocalStorageState } from "ahooks";
import { Button } from "antd";

export default function HomePage() {
  const [, setAccessToken] = useLocalStorageState<string>(STORAGE_ACCESS_TOKEN_KEY, {
    defaultValue: '',
  });
  const [, setRefreshToken] = useLocalStorageState<string>(STORAGE_REFRESH_TOKEN_KEY, {
    defaultValue: '',
  });
  return (
    <div>
      <h1>Home</h1>
      <Button onClick={() => {
        setAccessToken('')
        setRefreshToken('')
      }}> Logout </Button>
    </div>
  );
}
