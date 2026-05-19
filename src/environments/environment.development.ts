interface Environment {
  production: boolean;
  websiteAPI: string;
  aiAPI: string;
}

export const environment: Environment = {
  production: false,
  websiteAPI: 'http://192.168.10.123:8080',
  aiAPI: 'http://192.168.10.123:8080/api/user/ai/',
};
