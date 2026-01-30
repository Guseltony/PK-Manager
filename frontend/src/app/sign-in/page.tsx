import { getCookies } from "@/src/utils/getCookie";
import RegisterPage from "./SignInForm";

const Register = async () => {
  const serverCookies = await getCookies();

  console.log(serverCookies);
  return (
    <div>
      <RegisterPage />
    </div>
  );
};

export default Register;
