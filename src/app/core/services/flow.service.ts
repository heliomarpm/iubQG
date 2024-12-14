import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom, forkJoin, map, tap } from 'rxjs';

import { FlowDefinition } from '@app/shared/types';
import { environment } from '@env/environment';

import { SKIP_TOKEN, TokenService } from './token.service';

// import { HttpErrorHandlerService } from '../error';

@Injectable({
	providedIn: 'root',
})
export class FlowService {
	baseUrl = environment.apiSD9;
	constructor(
		protected http: HttpClient,
		protected tokenService: TokenService,
		// private httpError: HttpErrorHandlerService,
	) { }

	get<T>(flowName: string, version: number): Observable<T> {
		if (this.baseUrl === '/assets') {
			return this.http.get<T>(`${this.baseUrl}/${flowName}_${version}.json`);
		}

		return this.http.get<T>(`${this.baseUrl}/${flowName}/${version}`);
		// return this.http.get<T[]>(`${this.baseUrl}`, { headers: this.getHeaders(withAuth) }).pipe(catchError(this.httpError.handleError));
	}
	
	flow(flowNameOrId: string): Observable<FlowDefinition> {
		const flows = localStorage.getItem('publishFlows');
		const flowsArray: Array<FlowDefinition> = flows ? JSON.parse(flows) : [];

		const findFlow = (flows: FlowDefinition[], idOrName: string): FlowDefinition | undefined => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return flows.find(flow => flow.flowId === idOrName || flow.flowName === idOrName);
		};

		const flow = findFlow(flowsArray, flowNameOrId);

		if (!flows || !flow) {
			return new Observable(observer => {
				this.http.get<Array<FlowDefinition>>(`${environment.apiAVI}`).subscribe({
					next: data => {
						localStorage.setItem('publishFlows', JSON.stringify(data));

						const newFlow = findFlow(data, flowNameOrId);

						if (newFlow) {
							observer.next(newFlow);
						} else {
							observer.error('Flow not found');
						}

						observer.complete();
					},
					error: error => {
						observer.error(error);
					},
					complete: () => {
						console.log('getFlow~complete');
					},
				});
			});

			// (data) => {
			// localStorage.setItem('publishFlows', JSON.stringify(data));
			// const newFlow = findFlow(data, flowNameOrId);
			// if (newFlow) {
			// observer.next(newFlow);
			// } else {
			// observer.error('Flow not found');
			// }
			// observer.complete();
			// }, (error) => {
			// observer.error(error);
			// });
			// });
			// }
		}

		return new Observable(observer => {
			observer.next(flow);
			observer.complete();
		});
	}

	extractFlow<T>(flowId: string, flowVersion: number): Observable<T> {
		// const token = await firstValueFrom(this.tokenService.getToken());

		// console.log(token);

		// const headers = new HttpHeaders({
		// 	Authorization: `Bearer ${token.access_token}`,
		// });

		return this.http.get<T>(`/api/extrair/${flowId}/${flowVersion}`); //, { headers });
	}

	
	async loadFlows(): Promise<FlowDefinition[]> {
		const storedFlows = localStorage.getItem('FLOWS_DEFINITIONS');
		const expiration = localStorage.getItem('FLOWS_DEFINITIONS_EXPIRATION');
		const now = Date.now();

		// Se os dados estiverem no localStorage e não expiraram
		if (storedFlows && expiration && now < Number(expiration)) {
			return JSON.parse(storedFlows);
		}
		console.log('Buscando flows');

		const contextSkipToken = { context: new HttpContext().set(SKIP_TOKEN, true) };

		const proPUB$ = this.http.get(`${environment.api}/jornadas-published`, contextSkipToken);
		const proPIL$ = this.http.get(`${environment.api}/jornadas-pilot`, contextSkipToken);
		// const homPUB$ = this.http.get('/api/jornadas/hom/PUBLISH', contextSkipToken);

		const result = await firstValueFrom(
			forkJoin([proPUB$, proPIL$, proPIL$])
				.pipe(
					map(([proPub, proPil, homPub]) =>
						this.unifyFlows([
							{ data: proPub, ambient: 'prod' },
							{ data: proPil, ambient: 'prod' },
							{ data: homPub, ambient: 'hom' },
						])
					)
				));

		localStorage.setItem('FLOWS_DEFINITIONS', JSON.stringify(result));
		localStorage.setItem('FLOWS_DEFINITIONS_EXPIRATION', (now + 2 * 60 * 60 * 1000).toString()); // Expira em 2 horas

		return result;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private unifyFlows(flows: { data: any; ambient: string }[]): Array<FlowDefinition> {
		const mapFlows = new Map<string, FlowDefinition>();

		flows.forEach(({ data, ambient }) => {
			data.data.forEach((flow: { id_fluxo: string; nome_fluxo: string; versao_fluxo: number; nome_acao: string; data_edicao: string }) => {
				const { id_fluxo, nome_fluxo, versao_fluxo, nome_acao, data_edicao } = flow;

				if (!mapFlows.has(id_fluxo)) {
					mapFlows.set(id_fluxo, {
						flowId: id_fluxo,
						flowName: nome_fluxo||id_fluxo,

						versions: {
							hom: { pilot: 0, publish: 0 },
							prod: { pilot: 0, publish: 0 },
						},

						updatedAt: data_edicao,
					});
				}

				const item = mapFlows.get(id_fluxo)!;

				if (ambient === 'hom') {
					item.versions.hom[nome_acao === 'PUBLISHED' ? 'publish' : 'pilot'] = versao_fluxo;
				} else {
					item.versions.prod[nome_acao === 'PUBLISHED' ? 'publish' : 'pilot'] = versao_fluxo;
				}
			});
		});

		return Array.from(mapFlows.values());
	}
}
