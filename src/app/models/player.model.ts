export class PlayerModel {
    private id: number;
    name: string = '';
    skillLevel: number = 0;
    goal: number = 0;
    score: number = 0;

    constructor(id: number) {
        this.id = id;
    }
    
    public initInfo(name: string, skillLevel: number, goal: number): void {
        if (name.length === 0 || name.length > 8) {
            throw new Error('Name must be between 1 and 8 characters long.');
        }
        if (skillLevel < 1 || skillLevel > 9) {
            throw new Error('Skill level must be between 1 and 9.');
        }
        if (goal < 1) {
            throw new Error('Goal must be a positive number.');
        }

        this.name = name;
        this.skillLevel = skillLevel;
        this.goal = goal;
        this.score = 0;
    }

    public addScore(): void {
        this.score++;
    }

    public getId(): number {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }
    public getSkillLevel(): number {
        return this.skillLevel;
    }
    public getGoal(): number {
        return this.goal;
    }
    public getScore(): number {
        return this.score;
    }

}
