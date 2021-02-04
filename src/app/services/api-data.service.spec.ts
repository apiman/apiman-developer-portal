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

import { TestBed } from '@angular/core/testing';

import { ApiDataService } from './api-data.service';
import {KeycloakService} from 'keycloak-angular';
import {HttpClient} from '@angular/common/http';

describe('ApiDataService', () => {
  const httpClient = jasmine.createSpy('HttpClient');

  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      { provide: HttpClient, useValue: httpClient},
    ]
  }));

  it('should be created', () => {
    const service: ApiDataService = TestBed.get(ApiDataService);
    expect(service).toBeTruthy();
  });
});
