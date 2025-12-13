interface BaseProjectControl {
  abweichungSollPlan: number
  planStunden: number
  planUmsatz: number
  sollStunden: number
  sollUmsatz: number
}
export interface Forecast extends BaseProjectControl {
  abweichungPlanForecast: number
  abweichungSollForecast: number
  forecastStunden: number
  forecastUmsatz: number
}

export interface Revenue extends BaseProjectControl {
  abweichungPlanIst: number
  abweichungSollIst: number
  istStunden: number
  istUmsatz: number
}
