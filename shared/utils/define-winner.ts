import type { Point } from '#shared/types/point'
import type { Player } from '#shared/types/player'

export function defineWinner(points: Point[], requiredRows: number): Player | undefined {
    const players: Player[] = [ 'cross', 'circle' ]

    for (const player of players) {
        if (checkHorizontalWinner(player) || checkVerticalWinner(player) || checkDiagonalWinner(player)) {
            return player
        }
    }

    return undefined

    function checkHorizontalWinner(player: Player): boolean {
        for (let y = 1; y <= requiredRows; y++) {
            let count = 0
            for (let x = 1; x <= requiredRows; x++) {
                if (hasPoint(x, y, player)) {
                    count++
                }
            }
            if (count === requiredRows) {
                return true
            }
        }
        return false
    }

    function checkVerticalWinner(player: Player): boolean {
        for (let x = 1; x <= requiredRows; x++) {
            let count = 0
            for (let y = 1; y <= requiredRows; y++) {
                if (hasPoint(x, y, player)) {
                    count++
                }
            }
            if (count === requiredRows) {
                return true
            }
        }
        return false
    }

    function checkDiagonalWinner(player: Player): boolean {
        let count1 = 0
        let count2 = 0
        for (let i = 1; i <= requiredRows; i++) {
            if (hasPoint(i, i, player)) {
                count1++
            }
            if (hasPoint(i, requiredRows - i + 1, player)) {
                count2++
            }
        }
        return count1 === requiredRows || count2 === requiredRows
    }

    function hasPoint(x: number, y: number, player: Player): boolean {
        return points.some(point => point.X === x && point.Y === y && point.player === player)
    }
}