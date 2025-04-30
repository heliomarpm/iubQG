import { ToastrService } from "ngx-toastr";
import { forkJoin } from "rxjs";
import * as XLSX from "xlsx";

import { NgClass } from "@angular/common";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { Component, OnInit, ViewChild, signal } from "@angular/core";

import { FlowService } from "@app/core/services/flow.service";
import { skipToken } from "@app/core/services/token.service";
import { AutocompleteComponent } from "@app/shared/components";
import { FlowDefinition, JsonType } from "@app/shared/types";

import Comparator from "../../libs/comparator/comparator";
import { CodeModalComponent, CodeModalType } from "../../shared/components/code-modal";
import { Block, Comparison } from "./compare.model";

// const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

@Component({
	selector: "app-compare",
	standalone: true,
	imports: [HttpClientModule, CodeModalComponent, AutocompleteComponent, NgClass],
	templateUrl: "./compare.component.html",
	styleUrl: "./compare.component.scss",
})
export class CompareComponent implements OnInit {
	@ViewChild(CodeModalComponent) codeModalElement!: CodeModalComponent;

	codeModal: CodeModalType = { title: "", data: "" };

	data: Comparison = {
		flowName: "",
		newVersion: "",
		oldVersion: "",
		blocks: {
			deleted: [],
			recreated: [],
			recreatedUpdated: [],
			updated: [],
			added: [],
		},
	};

	icons = {
		flow: "flowsheet",
		check: "check",
		error: "error",
	};

	icoFlow = signal<string>("flowsheet");

	flowsData: FlowDefinition[] = [];
	searchData: string[] = [];

	constructor(
		protected http: HttpClient,
		private flowService: FlowService,
		private toastr: ToastrService
	) {}

	async ngOnInit() {
		this.flowsData = await this.flowService.loadFlows();
		this.searchData = this.flowsData.map((flow) => flow.flowName);
	}

	async compare(flowName: string, oldVersion: string, newVersion: string) {
		// const flow = this.flowsData.find(flow => flow.flowName === flowName || flow.flowId === flowName);

		// if (!flow) {
		// 	this.toastr.error('Flow not found');
		// 	return;
		// }

		// if ( Number(oldVersion) === 0) {
		// 	oldVersion = flow.versions.prod.pilot.toString() || '0';
		// }
		// if (Number(newVersion) === 0) {
		// 	newVersion = flow.versions.hom.publish.toString() || '0';
		// }

		const nOldVersion = Math.min(Number(oldVersion), Number(newVersion));
		const nNewVersion = Math.max(Number(oldVersion), Number(newVersion));

		if (nOldVersion === nNewVersion) {
			this.toastr.info("Os fluxos devem ter versões diferentes");
			return;
		}

		const oldFlow$ = this.flowService.get<JsonType>(flowName, nOldVersion);
		const newFlow$ = this.flowService.get<JsonType>(flowName, nNewVersion);
		// const oldFlow$ = this.flowService.extractFlow<JsonType>(flow.flowId, nOldVersion);
		// const newFlow$ = this.flowService.extractFlow<JsonType>(flow.flowId, nNewVersion);

		forkJoin([oldFlow$, newFlow$]).subscribe({
			next: ([oldData, newData]) => {
				try {
					const compare = new Comparator(oldData, newData);
					this.data = compare.runComparison();
				} catch (err) {
					if (err instanceof Error) {
						this.toastr.error(err.message, "Comparar versões");
					} else {
						this.toastr.error("Erro ao comparar versões", "Comparar versões");
					}
				}
			},
			// error: error => this.toastr.error(error.message, 'An error occurred:'),
		});

		// this.http.get<Comparison>('/assets/diff.json').subscribe(data => {
		// 	this.diff = data;
		// });
	}

	openDiffModal(title: string, data: unknown) {
		this.codeModal = { title, data };
		this.codeModalElement.openDialog();
	}

	scriptIUBot() {
		const blocks = (blocks: Array<Block>) => {
			return JSON.stringify(blocks.map((item) => item.activityName));
		};

		this.http.get("/assets/diff-change-color.js", { responseType: "text" }).subscribe((template) => {
			const script = template
				.replace("{{flowName}}", this.data.flowName)
				.replace("{{oldVersion}}", this.data.oldVersion)
				.replace("{{newVersion}}", this.data.newVersion)
				.replace("{{deletedBlocks}}", blocks(this.data.blocks.deleted))
				.replace("{{recreatedBlocks}}", blocks(this.data.blocks.recreated))
				.replace("{{recreatedUpdatedBlocks}}", blocks(this.data.blocks.recreatedUpdated))
				.replace("{{updatedBlocks}}", blocks(this.data.blocks.updated))
				.replace("{{addedBlocks}}", blocks(this.data.blocks.added));

			navigator.clipboard
				.writeText(script)
				.then(() => {
					this.icoFlow.set(this.icons.check);
					this.toastr.success("Abra o IUBot e cole o script no console", "Código copiado");
				})
				.catch((error) => {
					console.error("Error copying to clipboard:", error);
					this.icoFlow.set(this.icons.error);
					this.toastr.error("Erro ao copiar para área de transferência", "Error ao copiar");
				})
				.finally(() => setTimeout(() => this.icoFlow.set(this.icons.flow), 2000));

			// this.openDiffModal('Script IUBot', script);
		});
	}

	jsonResultDiff() {
		this.openDiffModal("Resultado Comparação", this.data);
	}

	exportToExcel(): void {
		const flatData = (Object.keys(this.data.blocks) as Array<keyof typeof this.data.blocks>).flatMap((groupKey) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return this.data.blocks[groupKey].map((block: any) => ({
				activityType: block.activityType,
				activityId: block.activityId,
				activityName: block.activityName,
				group: groupKey,
				old_activityId: groupKey.includes("recreated") ? block.diff[0].old : null,
			}));
		});

		// Converte para uma planilha
		const worksheet = XLSX.utils.json_to_sheet(flatData);
		const workbook = XLSX.utils.book_new();
		const sheetName = `${this.data.flowName}_${this.data.oldVersion}x${this.data.newVersion}`;
		XLSX.utils.book_append_sheet(workbook, worksheet, `diff_${this.data.oldVersion}_x_${this.data.newVersion}`);

		// Exporta para arquivo Excel
		XLSX.writeFile(workbook, `diferenca_${sheetName}.xlsx`);

		// Cria uma nova worksheet
		// const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(flatData);

		// // Cria um novo workbook e adiciona a worksheet
		// const workbook: XLSX.WorkBook = {
		//   Sheets: { 'Sheet1': worksheet },
		//   SheetNames: ['Sheet1']
		// };

		// // Converte o workbook para um arquivo Excel
		// const excelBuffer: any = XLSX.write(workbook, {
		//   bookType: 'xlsx',
		//   type: 'array'
		// });

		// this.saveAsExcelFile(excelBuffer, 'ExportedData');
	}

	// private saveAsExcelFile(buffer: any, fileName: string): void {
	//   const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
	//   saveAs(data, `${fileName}.xlsx`);
	// }
}
