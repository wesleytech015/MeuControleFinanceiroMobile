
package com.wesley.meucontrolefinanceiromobile.core.navigation

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.wesley.meucontrolefinanceiromobile.core.components.BarraMenuInferior

@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    val entradaAtual by navController.currentBackStackEntryAsState()
    val rotaAtual = entradaAtual?.destination?.route

    Scaffold(
        bottomBar = {
            BarraMenuInferior(
                rotaAtual = rotaAtual,
                aoNavegar = { rota ->
                    navController.navigate(rota) {
                        popUpTo(Routes.DASHBOARD) {
                            saveState = true
                        }
                        launchSingleTop = true
                        restoreState = true
                    }
                }
            )
        }
    ) { paddingValues ->

        NavHost(
            navController = navController,
            startDestination = Routes.DASHBOARD,
            modifier = Modifier.padding(paddingValues)
        ) {
            composable(Routes.DASHBOARD) {
                TelaProvisoria("Dashboard")
            }

            composable(Routes.RECEITAS) {
                TelaProvisoria("Receitas")
            }

            composable(Routes.DESPESAS) {
                TelaProvisoria("Despesas")
            }

            composable(Routes.MOVIMENTACOES) {
                TelaProvisoria("Movimentações")
            }
        }
    }
}

@Composable
private fun TelaProvisoria(titulo: String) {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = titulo)
    }
}
