import * as axios from 'axios';
import * as soap from 'soap'
import { IAfasConnectorConfig, Languages, TAfasRestProfileResponse, THttpMethods } from '../models';
import { endpoints } from '../constants';
import * as https from 'https';

export default abstract class Connector {
  private AfasConfig: IAfasConnectorConfig;

  constructor(AfasConfig: IAfasConnectorConfig) {
    this.AfasConfig = AfasConfig;
  }

  // Should the env variable contain text, its trimmed and only the numbers are returned
  private get env() {
    return this.AfasConfig.env.replace(/[^\d.]/g, '');
  }

  private get type() {
    return this.AfasConfig.type ? this.AfasConfig.type : 'rest'
  }

  private get profitservice () {
    return this.type === 'rest' ? 'ProfitRestServices' : 'ProfitServices'
  }

  private get token() {
    return this.AfasConfig.token;
  }

  private get language() {
    return this.AfasConfig.language ? this.AfasConfig.language : Languages.Dutch;
  }

  protected get afasUrl() {
    return 'https://' + this.env + '.' + endpoints[this.type][this.AfasConfig.envType] + `/${this.profitservice}/`;
  }

  protected get connectorUrl() {
    return 'https://' + this.env + '.' + endpoints[this.type][this.AfasConfig.envType] + `/${this.profitservice}/connectors/`;
  }

  protected get metainfoUrl() {
    return 'https://' + this.env + '.' + endpoints[this.type][this.AfasConfig.envType] + `/${this.profitservice}/metainfo/`;
  }

  protected get insiteUrl() {
    return 'https://' + this.env + '.afasinsite.nl'
  }

  protected async profileRequest (tokenUrl: string, data: any): Promise<TAfasRestProfileResponse | false> {
    const response = await fetch(tokenUrl, {
      method: "POST",
      body: data,
      headers:{
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    if (response.ok) {
      return await response.json()
    } else {
      return false
    }
  }

  protected async OTPRequest (userid: string, apiKey: string, apiToken: string): Promise<boolean> {
    const url = this.afasUrl + 'otprequest'
    const data = {
      userid,
      apiKey,
      apiToken
    }

    const response = await fetch(url, { method: "POST", body: JSON.stringify(data) })

    if (response.ok) {
      // Reponse is 201 even if the apiKey and apiToken do not match
      return true
    } else {
      return false
    }
  }

  protected async OTPValidate (userid: string, apiKey: string, apiToken: string, otp: string): Promise<string | false> {
    const url = this.afasUrl + 'otpvalidation'
    const data = {
      userid,
      apiKey,
      apiToken,
      otp
    };

    const response = await fetch(url, { method: "POST", body: JSON.stringify(data) })

    if (response.ok) {
      const body = await response.json()
      return body.token
    } else {
      return false
    }
  }

  /**
   * HTTP function with AFAS authorization
   *
   * @param url {string} http://example.com
   * @param method {string} GET, POST, PUT, DELETE
   * @param body {string} Optional, should be a valid JSON object
   * @param customConfig {RequestInit} default http request config
   */
  protected async http(url: string, method: THttpMethods, body?: object, customConfig?: axios.AxiosRequestConfig): Promise<any> {
    let config: axios.AxiosRequestConfig = {
      method,
      headers: {
        Authorization: 'AfasToken ' + Buffer.from(this.token).toString('base64'),
        'Accept-Language': this.language
      },
      timeout: 0, // No timeout (but limited to OS setting)
      httpsAgent: new https.Agent({ keepAlive: true })
    };

    if (body) {
      config.data = JSON.stringify(body);
    }

    if (customConfig) {
      config = { ...config, ...customConfig };
    }

    try {
      const response = await axios.default(url, config);
      return response.data;
    }
    catch (err: any) {
      if (err.response) {
        throw { body: err.response.data, response: err.response };
      }
      else {
        throw err;
      }
    }
  }

  /**
   * 
   * @param url {string} WSDL url
   * @param args {object} arguments
   * @param methodname {string} client methodname
   * @returns any
   */
  protected async execute (url: string, args: object, methodname: string): Promise<any> {
    return await new Promise(async (resolve, reject) => {
      soap.createClientAsync(url)
        .then(client => {
          client[methodname]({...args, 'token': this.token}, (err: any, result:any) => {
            if (err) reject(err)
            resolve(result)
          })
        })
        .catch(reject)
    })
  }
}
