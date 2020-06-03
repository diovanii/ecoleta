import Knex from 'knex'

export async function seed(knex: Knex) {
  await knex('items').insert([
    { title: 'Lâmpadas', image: 'lamps.svg' },
    { title: 'Pilhas e baterias', image: 'batteries.svg' },
    { title: 'Papéis e papelão', image: 'paper.svg' },
    { title: 'Resíduos eletrônicos', image: 'electronics.svg' },
    { title: 'Resíduos orgânicos', image: 'organics.svg' },
    { title: 'Óleo de cozinha', image: 'oil.svg' }
  ])
}
