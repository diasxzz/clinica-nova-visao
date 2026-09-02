import logo from '../assets/logo-clinica-nova-visao.png'

function ClinicLogo({ className = '' }) {
  return (
    <img
      src={logo}
      alt="Clínica Nova Visão"
      className={`clinic-logo ${className}`}
    />
  )
}

export default ClinicLogo
