import { Refeicao } from "./refeicao"

export interface Dieta {
  email: string
  descricao: string
  refeicoes: Refeicao[]
}

