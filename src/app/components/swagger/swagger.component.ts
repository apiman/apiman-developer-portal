/*
 * Copyright 2020 Scheer PAS Schweiz AG
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {environment} from '../../../environments/environment';

declare const SwaggerUIBundle: any;

@Component({
  selector: 'app-swagger',
  templateUrl: './swagger.component.html',
  styleUrls: ['./swagger.component.scss']
})
export class SwaggerComponent implements OnInit {

  private apiMgmtUiRestUrl: string = environment.apiMgmtUiRestUrl;

  constructor(private route: ActivatedRoute) {
  }

  /**
   * Load the swagger definition and display it with the swagger ui bundle library on component initialization
   */
  ngOnInit() {
    const developerId = this.route.snapshot.paramMap.get('developerId');
    const organizationId = this.route.snapshot.paramMap.get('orgId');
    const apiId = this.route.snapshot.paramMap.get('apiId');
    const version = this.route.snapshot.paramMap.get('version');

    const isPublicApi = history.state.data ? history.state.data.publicAPI : false;
    let apiStatus = history.state.data ? history.state.data.apiStatus : null;
    let apiKey = history.state.data ? history.state.data.apikey : null;

    if (!isPublicApi) {
      if (apiStatus) {
        // save status for reloading page
        sessionStorage.setItem('lastApiStatus', apiStatus);
      } else {
        apiStatus = sessionStorage.getItem('lastApiStatus');
      }

      if (apiKey) {
        // save key for reloading page
        sessionStorage.setItem('lastSwaggerApiKey', apiKey);
      } else {
        apiKey = sessionStorage.getItem('lastSwaggerApiKey');
      }
    }

    let swaggerURL = this.apiMgmtUiRestUrl + '/developers';
    if (!isPublicApi) {
      swaggerURL += '/' + developerId;
    }
    swaggerURL += '/organizations/' + organizationId + '/apis/' + apiId + '/versions/' + version + '/definition';

    const CheckAllowTryItOutPlugin = () => {
      return {
        statePlugins: {
          spec: {
            wrapSelectors: {
              // Enable TryOut Button only for active APIs
              allowTryItOutFor: () => () => apiStatus === 'Active'
            }
          }
        }
      };
    };

    const DisableAuthorizePlugin = () => ({ wrapComponents: { authorizeBtn: () => () => null } });

    let apiKeySecuritySettingName = 'X-API-Key';

    const swaggerOptions = {
      dom_id: '#swagger-editor',
      layout: 'BaseLayout',
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset
      ],
      plugins: [
        CheckAllowTryItOutPlugin
      ],
      url: swaggerURL,
      docExpansion: 'none',
      operationsSorter: 'alpha',
      requestInterceptor: (request) => {
        if (request.url === swaggerURL) {
          // set bearer token for authentication to get swagger file
          request.headers.Authorization = 'Bearer ' + sessionStorage.getItem('api_mgmt_keycloak_token');
        } else if (!isPublicApi) {
          const url = new URL(request.url);
          // set api key to authorize all api requests also for option requests
          url.searchParams.append('apiKey', apiKey);
          request.url = url.toString();
        }
        return request;
      },
      responseInterceptor: (response) => {
        if (response.url === swaggerURL) {
          // determine apiKeySecuritySettingName by request of getting swagger definition
          if (response.body && response.body.securityDefinitions) {
            const securityDefinitions = Object.values(response.body.securityDefinitions);
            // @ts-ignore
            const apiKeySecuritySetting = securityDefinitions.find((securitySetting) => securitySetting.type === 'apiKey');
            if (apiKeySecuritySetting) {
              // @ts-ignore
              // overwrite the default api key name
              apiKeySecuritySettingName = apiKeySecuritySetting.name;
            }
          }
        }
      },
      onComplete: () => {
        // set api key in swagger view to make it look like authorized for calls
        // this option is not enough to send OPTION requests to gateway protected apis
        // sending this api key as header in option requests are blocked by the browser
        swaggerUI.preauthorizeApiKey(apiKeySecuritySettingName, apiKey);
      }
    };
    if (apiStatus === 'Inactive') {
      // @ts-ignore
      swaggerOptions.plugins.push(DisableAuthorizePlugin);
    }

    const swaggerUI = SwaggerUIBundle(swaggerOptions);
  }

}
