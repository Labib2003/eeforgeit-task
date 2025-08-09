import LoginForm from "@/components/custom/LoginForm";

const Login = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
      <section className="bg-black hidden lg:block"></section>

      <section className="grid place-items-center">
        <LoginForm />
      </section>
    </div>
  );
};

export default Login;
