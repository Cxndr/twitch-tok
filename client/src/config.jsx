const SERVER_URL =
  import.meta.env.MODE === 'development'
    ? import.meta.env.VITE_SERVERURL_DEV
    : import.meta.env.VITE_SERVERURL_PROD

    
export default SERVER_URL;