import { Refeicao } from "./refeicao"

export interface Dieta {
  id: number
  email: string
  descricao: string
  refeicoes: Refeicao[]
}

