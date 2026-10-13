
package com.wesley.meucontrolefinanceiromobile.core.components

import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import com.wesley.meucontrolefinanceiromobile.core.navigation.Routes

@Composable
fun BarraMenuInferior(
    rotaAtual: String?,
    aoNavegar: (String) -> Unit
) {
    val itens = listOf(
        Routes.DASHBOARD to "Início",
        Routes.RECEITAS to "Receitas",
        Routes.DESPESAS to "Despesas",
        Routes.MOVIMENTACOES to "Movimentações"
    )

    NavigationBar {
        itens.forEach { (rota, titulo) ->
            NavigationBarItem(
                selected = rotaAtual == rota,
                onClick = { aoNavegar(rota) },
                icon = { Text("•") },
                label = { Text(titulo) }
            )
        }
    }
}
