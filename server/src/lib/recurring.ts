import { RecurringRule } from "../models/RecurringRule";
import type { RecurringFrequency } from "../models/RecurringRule";
import { Transaction } from "../models/Transaction";

const MAX_PER_RULE = 60;

export function startOfTodayUTC(): Date {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
}

export function advanceDate(date: Date, frequency: RecurringFrequency): Date {
  const next = new Date(date.getTime());

  if (frequency === "weekly") {
    next.setUTCDate(next.getUTCDate() + 7);
  } else {
    next.setUTCMonth(next.getUTCMonth() + 1);
  }

  return next;
}

export async function syncRecurring(userId: string): Promise<number> {
  const today = startOfTodayUTC();

  const rules = await RecurringRule.find({
    user: userId,
    active: true,
    nextDue: { $lte: today },
  });

  let created = 0;

  for (const rule of rules) {
    let due = rule.nextDue;

    for (let step = 0; step < MAX_PER_RULE && due.getTime() <= today.getTime(); step += 1) {
      const next = advanceDate(due, rule.frequency);

      const claimed = await RecurringRule.findOneAndUpdate(
        { _id: rule._id, nextDue: due },
        { $set: { nextDue: next } }
      );

      if (claimed) {
        await Transaction.create({
          user: rule.user,
          type: rule.type,
          amount: rule.amount,
          category: rule.category,
          note: rule.note,
          date: due,
          recurringId: rule._id,
          expiresAt: rule.expiresAt,
        });
        created += 1;
      }

      due = next;
    }
  }

  return created;
}