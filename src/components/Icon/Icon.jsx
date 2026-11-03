export default function Icon({ name, ...props }) {
  return <img src={`/assets/${name}.svg`} alt="" {...props} />
}
