import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Dieta } from '../../interfaces/dieta';

@Injectable({
  providedIn: 'root'
})
export class DietaService {

  constructor() { }

  getDieta(): Observable<Dieta[]> {
    var dietas = [];
    var diaAtual = 15

    for (let index = 1; index < 30; index++) {
  
      dietas.push(
        {
          "email": "",
          "descricao": "20 min de aeróbico",
          "status": ((index < diaAtual) ? "concluido" : (index == diaAtual) ? "atual" : (index <= diaAtual + 5) ? "preview" : "bloqueado"),
          "refeicoes": [
            { "index": 1, "hora": "07:00" ,"refeicao": "Café da manhã (pré-treino)",   "descricao": "30g Paçoca de rolha / pasta de amendoim pura, 200g Omelete/ ovo mexido/ ovo cozido, 60ml Café/ chá natural/ suco natural (com adoçante)" },
            { "index": 2, "hora": "10:00" ,"refeicao": "Lanche da manhã (pós-treino)", "descricao": "Suplementação: Whey Protein Concentrado (com água)" },
            { "index": 3, "hora": "13:00" ,"refeicao": "Almoço",                       "descricao": "70g Salada (somente verduras) +, 200g Proteína (peixe/ frango/ carne bovina)" },
            { "index": 4, "hora": "16:00" ,"refeicao": "Lanche da tarde",              "descricao": "220g Proteína (frango desfiado/ patinho moído/ tilápia), 90g Verdura (alface/ rúcula/ acelga/ repolho/ agrião)" },
            { "index": 5, "hora": "19:00" ,"refeicao": "Jantar",                       "descricao": "1) 70g Salada(verduras) + 200g Proteína 2), 30g Fruta (abacaxi/ melancia/ laranja/ melão)" },
            { "index": 6, "hora": "22:00" ,"refeicao": "Suplementação",                "descricao": "Suplementação: Creatina +, Suco de uva integral" },
            { "index": 7, "hora": "23:00" ,"refeicao": "Emergencial",                  "descricao": "Suplementação: Albumina" }
          ]
        },
      )
    }
    return of(dietas);
  }
}
