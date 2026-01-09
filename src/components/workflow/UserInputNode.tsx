import { Handle, Position } from 'reactflow';
import { Textarea } from '@/components/ui/textarea';

// هذه العقدة تسمح للمستخدم بكتابة "المدخلات" (Prompt)
const UserInputNode = ({ data }: any) => {
    return (
        <div className="bg-[#1e1e2e] border border-neon-purple/50 rounded-xl w-[300px] shadow-lg shadow-neon-purple/10 font-cairo" dir="rtl">
            <div className="bg-neon-purple/20 p-3 rounded-t-xl border-b border-neon-purple/20">
                <span className="font-bold text-neon-purple text-sm">📝 مدخلات المستخدم</span>
            </div>

            <div className="p-4">
                <Textarea
                    placeholder="اكتب فكرتك هنا..."
                    className="bg-black/30 border-white/10 text-white min-h-[80px] text-sm resize-none focus-visible:ring-neon-purple"
                    onChange={(evt) => data.onChange?.(evt.target.value)}
                    defaultValue={data.value || ''}
                />
            </div>

            {/* مخرج البيانات (Source) */}
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-neon-purple border-2 border-[#1e1e2e]" />
        </div>
    );
};

export default UserInputNode;
