// AxiosApiClient.js

import axios from 'axios';

const apiBackends = [
    "phpLaravel",
    "javaSpringBoot",
    "pythonFastApi",
    "nodeExpress",
    "graphQL"
];

// Function to check if the variable exists in the array and return its value
const findBackend = (apiToFind) => {
    return apiBackends.find(backend => backend === apiToFind);
};

const apiClients = {
    phpLaravel: axios.create({
        baseURL: process.env.REACT_APP_PHP_LARAVEL_BACKEND_URL,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        withCredentials: true, // Ensure cookies (like CSRF tokens) are sent
    }),
    javaSpringBoot: axios.create({
        baseURL: process.env.REACT_APP_JAVA_SPRING_BOOT_BACKEND_URL,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        // Add specific configurations for Spring Boot API
    }),
    pythonFastApi: axios.create({
        baseURL: process.env.REACT_APP_PYTHON_FASTAPI_BACKEND_URL,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        // Add specific configurations for FastAPI
    }),
    nodeExpress: axios.create({
        baseURL: process.env.REACT_APP_NODE_EXPRESS_BACKEND_URL,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        // Add specific configurations for FastAPI
    }),
    graphQL: axios.create({
        baseURL: process.env.REACT_APP_GRAPHQL_BACKEND_URL,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        // Add specific configurations for FastAPI
    }),
};

const AxiosApiClient = ({ apiBackend, token }) => {
    const apiClient = apiClients[apiBackend];

    // Interceptor to add token to request headers
    apiClient.interceptors.request.use(config => {
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // Interceptor to handle errors globally
    apiClient.interceptors.response.use(
        response => response,
        error => {
            // Handle error globally
            return Promise.reject(error);
        }
    );

    // Method to retrieve CSRF token for Laravel API
    const getBearerToken = async () => {
        if(apiBackend === process.env.REACT_APP_PHP_LARAVEL){
            try {
                console.log('AxiosApiClient.getBearerToken() baseUrl: ' + process.env.REACT_APP_PHP_LARAVEL_BACKEND_URL);
                console.log('AxiosApiClient.getBearerToken() sanctum call: ' + process.env.REACT_APP_PHP_LARAVEL_RETRIEVE_TOKEN_END_POINT);
                await apiClient.get(process.env.REACT_APP_PHP_LARAVEL_RETRIEVE_TOKEN_END_POINT);
            } catch (error) {
                console.error('AxiosApiClient.getBearerToken(): CSRF token retrieval not supported for this php laravel backend:', error);
            }
        }else if(apiBackend === process.env.REACT_APP_JAVA_SPRINGBOOT){
            try {
                console.log('AxiosApiClient.getBearerToken() baseUrl: ' + process.env.REACT_APP_JAVA_SPRING_BOOT_BACKEND_URL);
                console.log('AxiosApiClient.getBearerToken() sanctum call: ' + process.env.REACT_APP_JAVA_SPRING_BOOT_RETRIEVE_TOKEN_END_POINT);
                await apiClient.get(process.env.REACT_APP_JAVA_SPRING_BOOT_RETRIEVE_TOKEN_END_POINT);
            } catch (error) {
                console.warn('AxiosApiClient.getBearerToken(): JWT token retrieval not supported for this java spring boot backend', error);
            }
        }else if(apiBackend === process.env.REACT_APP_PYTHON_FASTAPI){
            try {
                console.log('AxiosApiClient.getBearerToken() baseUrl: ' + process.env.REACT_APP_PYTHON_FASTAPI_BACKEND_URL);
                console.log('AxiosApiClient.getBearerToken() sanctum call: ' + process.env.REACT_APP_PYTHON_FASTAPI_RETRIEVE_TOKEN_END_POINT);
                await apiClient.get(process.env.REACT_APP_PYTHON_FASTAPI_RETRIEVE_TOKEN_END_POINT);
            } catch (error) {
                console.warn('AxiosApiClient.getBearerToken(): JWT token retrieval not supported for this python fastapi backend', error);
            }
        }else if(apiBackend === process.env.REACT_APP_NODE_EXPRESS){
            try {
                console.log('AxiosApiClient.getBearerToken() baseUrl: ' + process.env.REACT_APP_NODE_EXPRESS_BACKEND_URL);
                console.log('AxiosApiClient.getBearerToken() sanctum call: ' + process.env.REACT_APP_NODE_EXPRESS_RETRIEVE_TOKEN_END_POINT);
                await apiClient.get(process.env.REACT_APP_NODE_EXPRESS_RETRIEVE_TOKEN_END_POINT);
            } catch (error) {
                console.warn('AxiosApiClient.getBearerToken(): JWT token retrieval not supported for this node express backend', error);
            }
        }else if(apiBackend === process.env.REACT_APP_GRAPHQL){
            try {
                console.log('AxiosApiClient.getBearerToken() baseUrl: ' + process.env.REACT_APP_GRAPHQL_BACKEND_URL);
                console.log('AxiosApiClient.getBearerToken() sanctum call: ' + process.env.REACT_APP_GRAPHQL_RETRIEVE_TOKEN_END_POINT);
                await apiClient.get(process.env.REACT_APP_GRAPHQL_RETRIEVE_TOKEN_END_POINT);
            } catch (error) {
                console.warn('AxiosApiClient.getBearerToken(): JWT token retrieval not supported for this graphQL backend', error);
            }
        }
    };

  // Method to make a request with additional headers
  const makeRequestWithHeaders = async (method, url, data, headers = {}) => {
    try {
      const config = {
        method,
        url,
        data,
        headers: {
          ...apiClient.defaults.headers,
          ...headers,
        },
      };

      const response = await apiClient(config);
      return response;
    } catch (error) {
      console.error('Error making request:', error);
      throw error;
    }
  };

  return { apiClient, getBearerToken, makeRequestWithHeaders };
};

export { apiBackends, findBackend };
export default AxiosApiClient;
