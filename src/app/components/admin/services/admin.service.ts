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

import {from, Observable, of} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {ClientSearchResult, Developer} from '../../../services/api-data.service';
import {HttpClient} from '@angular/common/http';
import {KeycloakInteractionService} from './keycloak-interaction.service';
import {environment} from '../../../../environments/environment';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiMgmtUiRestUrl: string = environment.apiMgmtUiRestUrl;

  /**
   * Constructor of Admin Service
   * @param http Http Client
   * @param keycloak Keycloak Interaction Service
   * @param apiMgmtUiRestUrl Api Management UI REST Url
   */
  constructor(private http: HttpClient,
              private keycloak: KeycloakInteractionService) {
  }

  /**
   * Get all available developers
   */
  public getAllDevelopers() {
    const url = this.apiMgmtUiRestUrl + '/developers';
    return this.http.get(url) as Observable<Array<Developer>>;
  }

  /**
   * Get developer by developer id
   * @param developerId The developer id
   */
  public getDeveloper(developerId: string) {
    const url = this.apiMgmtUiRestUrl + '/developers/' + developerId;
    return this.http.get(url) as Observable<Developer>;
  }

  /**
   * Get all keycloak users
   */
  public getDevPortalUsers() {
    return from(this.keycloak.getDevPortalUsers());
  }

  /**
   * Create new developer
   * @param developer the developer to create
   */
  public createNewDeveloper(developer: Developer): Observable<Developer> {
    // observer insert developer to API-Mgmt
    // response has developer object
    const url = this.apiMgmtUiRestUrl + '/developers';
    return this.http.post(url, developer) as Observable<Developer>;
  }

  /**
   * Update a developer
   * @param developer the developer to update
   */
  public updateDeveloper(developer: Developer) {
    const url = this.apiMgmtUiRestUrl + '/developers/' + developer.id;
    return this.http.put(url, {
      clients: developer.clients
    });
  }

  /**
   * Delete a developer
   * @param developer the developer to update
   */
  public deleteDeveloper(developer: Developer) {
    const url = this.apiMgmtUiRestUrl + '/developers/' + developer.id;
    return this.http.delete(url);
  }

  /**
   * Get all available clients
   */
  public getAllClients() {
    const url = this.apiMgmtUiRestUrl + '/search/clients';
    const searchQuery = {
      filters: [{
        name: 'name',
        value: '*',
        operator: 'like'
      }],

      paging: {
        page: '1',
        pageSize: '10000'
      }
    };
    return (this.http.post(url, searchQuery) as Observable<ClientSearchResult>)
      .pipe(mergeMap(searchResult => searchResult.beans.length > 0 ? searchResult.beans : of(null)));
  }
}
