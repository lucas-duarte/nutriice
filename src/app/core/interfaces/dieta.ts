import { Refeicao } from "./refeicao"

export interface Dieta {
  dia: number
  exercicio: string
  status: string,
  refeicoes: Refeicao[]
}

