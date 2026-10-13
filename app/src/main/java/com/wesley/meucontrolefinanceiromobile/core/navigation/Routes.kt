package com.wesley.meucontrolefinanceiromobile.core.navigation

object Routes {
    const val LOGIN = "login"
    const val CADASTRO = "cadastro"
    const val DASHBOARD = "dashboard"
    const val RECEITAS = "receitas"
    const val DESPESAS = "despesas"
    const val MOVIMENTACOES = "movimentacoes"
    const val DETALHE_MOVIMENTACAO = "movimentacao/{id}"

    fun detalheMovimentacao(id: Long): String {
        return "movimentacao/$id"
    }
}