import "../styles/custom.scss";
import "../styles/styles.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { AuthProvider } from "../context/Auth";
import { Provider } from "react-redux";
import { wrapper } from "../redux/store";
import { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps) => {
  const { store } = wrapper.useWrappedStore(pageProps);

  return (
    <Provider store={store}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </Provider>
  );
};

export default App;
