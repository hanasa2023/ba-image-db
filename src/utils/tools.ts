export function parseRedisHash<T>(hash: Record<string, string>): T {
  const parsedData = Object.entries(hash).reduce((acc, [field, value]) => {
    const parsedValue = isNaN(Number(value)) ? value : Number(value)
    acc[field as keyof T] = parsedValue as T[keyof T]
    return acc
  }, {} as T)

  return parsedData
}
