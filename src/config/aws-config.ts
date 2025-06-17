
interface AmplifyConfig {
  Auth: {
    Cognito: {
      userPoolId: string;
      userPoolClientId: string;
      loginWith: {
        phone: boolean; // Enable phone number login
      };
      authenticationFlowType: string;
    }
  };
}


const awsConfig: AmplifyConfig = {
  Auth: {  
    Cognito: { 
      userPoolId: import.meta.env.VITE_USER_POOL_ID, 
      userPoolClientId: import.meta.env.VITE_CLIENT_ID, 
      loginWith: {
        phone: true, // Enable phone number login
      },
      authenticationFlowType: 'CUSTOM_AUTH', // Required for OTP flows
    }
  }
};

export default awsConfig;
