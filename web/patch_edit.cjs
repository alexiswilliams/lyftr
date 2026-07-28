const fs = require('fs');
let code = fs.readFileSync('src/pages/EditWorkout.tsx', 'utf8');

code = code.replace(
  `exercises: { exercise_id: number; notes: string; sets: { set_number: number; reps: number; weight: number }[] }[]`,
  `exercises: { exercise_id: number; notes: string; rest_seconds: number; sets: { set_number: number; reps: number; weight: number; is_warmup?: boolean; set_type?: 'normal' | 'warmup' | 'drop'; rest_seconds?: number }[] }[]`
);

code = code.replace(
  `            exercise_id: ex.exercise_id,
            notes: ex.notes || '',
            sets: (ex.sets || []).map(s => ({ set_number: s.set_number, reps: s.reps, weight: lbsToDisplay(s.weight, settings.weight_unit) })),`,
  `            exercise_id: ex.exercise_id,
            notes: ex.notes || '',
            rest_seconds: ex.rest_seconds ?? (settings.rest_seconds_default ?? 90),
            sets: (ex.sets || []).map(s => ({ set_number: s.set_number, reps: s.reps, weight: lbsToDisplay(s.weight, settings.weight_unit), is_warmup: s.is_warmup, set_type: s.set_type || (s.is_warmup ? 'warmup' : 'normal'), rest_seconds: s.rest_seconds })),`
);

code = code.replace(
  `setFormData(prev => ({ ...prev, exercises: [...prev.exercises, { exercise_id: exercise.id, notes: '', sets: [{ set_number: 1, reps: 0, weight: 0 }] }] }))`,
  `setFormData(prev => ({ ...prev, exercises: [...prev.exercises, { exercise_id: exercise.id, notes: '', rest_seconds: settings.rest_seconds_default ?? 90, sets: [{ set_number: 1, reps: 0, weight: 0, set_type: 'normal', rest_seconds: 0 }] }] }))`
);

code = code.replace(
  `      const exercises = [...prev.exercises]
      exercises[exIdx].sets.push({ set_number: exercises[exIdx].sets.length + 1, reps: 0, weight: 0 })`,
  `      const last = exercises[exIdx].sets[exercises[exIdx].sets.length - 1]
      exercises[exIdx].sets.push({ set_number: exercises[exIdx].sets.length + 1, reps: last?.reps ?? 0, weight: last?.weight ?? 0, set_type: last?.set_type ?? 'normal', rest_seconds: last?.rest_seconds ?? 0 })`
);

code = code.replace(
  `      ;(exercises[exIdx].sets[setIdx] as any)[field] = Number(value) || 0`,
  `      if (typeof value === 'boolean') {
        ;(exercises[exIdx].sets[setIdx] as any)[field] = value
      } else if (field === 'set_type') {
        ;(exercises[exIdx].sets[setIdx] as any)[field] = value
      } else {
        ;(exercises[exIdx].sets[setIdx] as any)[field] = Number(value) || 0
      }`
);

code = code.replace(
  `                        <div className="flex-shrink-0 w-12">
                          <label className="text-xs text-tx-muted font-medium uppercase tracking-wider block">Set</label>
                          <div className="text-sm font-bold text-tx-primary bg-surface-muted px-2 py-1 rounded text-center">{set.set_number}</div>
                        </div>`,
  `                        <div className="flex-shrink-0 w-12 cursor-pointer" onClick={() => {
                          const nextType = set.set_type === 'normal' ? 'warmup' : set.set_type === 'warmup' ? 'drop' : 'normal'
                          updateSet(exIdx, setIdx, 'set_type', nextType)
                        }}>
                          <label className="text-xs text-tx-muted font-medium uppercase tracking-wider block cursor-pointer">Set</label>
                          <div className={\`text-sm font-bold px-2 py-1 rounded text-center transition-colors \${set.set_type === 'warmup' ? 'bg-orange-500/20 text-orange-500' : set.set_type === 'drop' ? 'bg-error-500/20 text-error-500' : 'bg-surface-muted text-tx-primary'}\`}>
                            {set.set_type === 'warmup' ? 'W' : set.set_type === 'drop' ? 'D' : workoutEx.sets.slice(0, setIdx + 1).filter(s => s.set_type !== 'warmup').length}
                          </div>
                        </div>`
);

code = code.replace(
  `                        <button type="button" onClick={() => removeSet(exIdx, setIdx)} className="p-2 hover:bg-error-500/20 rounded transition-colors flex-shrink-0">
                          <Trash2 className="w-4 h-4 text-error-400" />
                        </button>
                      </div>`,
  `                        <button type="button" onClick={() => removeSet(exIdx, setIdx)} className="p-2 hover:bg-error-500/20 rounded transition-colors flex-shrink-0">
                          <Trash2 className="w-4 h-4 text-error-400" />
                        </button>
                      </div>
                      {/* Inline Rest Timer */}
                      <div className="flex justify-center -mt-3 relative z-10 mb-2">
                         <button
                           type="button"
                           onClick={() => {
                             const val = window.prompt("Enter rest time in seconds for this set:", String(set.rest_seconds || ''))
                             if (val !== null) {
                               const secs = parseInt(val, 10)
                               if (!isNaN(secs)) {
                                 updateSet(exIdx, setIdx, 'rest_seconds', secs)
                               }
                             }
                           }}
                           className="bg-surface-raised border border-surface-border rounded-full px-3 py-0.5 text-xs font-bold text-brand-400 cursor-pointer shadow-sm hover:bg-surface-muted transition-colors"
                         >
                           {set.rest_seconds ? \`\${Math.floor(set.rest_seconds / 60)}:\${(set.rest_seconds % 60).toString().padStart(2, '0')}\` : 'Default'}
                         </button>
                      </div>`
);

fs.writeFileSync('src/pages/EditWorkout.tsx', code);
