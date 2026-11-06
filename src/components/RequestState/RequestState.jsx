export default function RequestState({ loading, error, retry }) {
  if (loading)
    return (
      <p className="request-state" role="status">
        Loading titles…
      </p>
    )
  if (error)
    return (
      <div className="request-state" role="alert">
        <p>{error}</p>
        <button className="primary-button" onClick={retry}>
          Try again
        </button>
      </div>
    )
  return null
}
