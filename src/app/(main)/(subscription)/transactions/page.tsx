import { Card, CardContent } from "@/components/ui/card";
import { getTransactionHistory, Transaction } from "@/lib/actions/subscription";
import TransactionsHeader from "./_components/header";
import BottomNav from "@/components/bottomNav";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

export default async function TransactionHistoryPage() {
    const result = await getTransactionHistory({
        limit: 50,
    });

    const transactions = result.ok && result.data ? result.data.transactions : [];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatPrice = (amount: number, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(amount);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "SUCCEEDED":
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case "FAILED":
                return <XCircle className="w-5 h-5 text-red-600" />;
            case "PENDING":
                return <Clock className="w-5 h-5 text-yellow-600" />;
            case "REFUNDED":
                return <RefreshCw className="w-5 h-5 text-blue-600" />;
            default:
                return <Clock className="w-5 h-5 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "SUCCEEDED":
                return "text-green-600";
            case "FAILED":
                return "text-red-600";
            case "PENDING":
                return "text-yellow-600";
            case "REFUNDED":
                return "text-blue-600";
            default:
                return "text-gray-600";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "SUCCEEDED":
                return "Successful";
            case "FAILED":
                return "Failed";
            case "PENDING":
                return "Pending";
            case "REFUNDED":
                return "Refunded";
            default:
                return status;
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="bg-[#DDF3E5] p-4 rounded-b-[50px]">
                <div className="md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto w-full">
                    <TransactionsHeader />
                </div>
            </div>

            <div className="flex-1 px-4 py-6">
                <div className="md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto w-full">
                    {transactions.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <p className="font-poppins-400 text-[#484848]">
                                    No transactions found.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((transaction: Transaction) => (
                                <Card key={transaction.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                {getStatusIcon(transaction.status)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-poppins-600 text-sm text-[#121212] truncate">
                                                            {transaction.description || transaction.type || "Payment"}
                                                        </p>
                                                        <p className="font-poppins-400 text-xs text-[#484848] mt-1">
                                                            {formatDate(transaction.createdAt)}
                                                        </p>
                                                        {transaction.plan && (
                                                            <p className="font-poppins-400 text-xs text-[#484848] mt-0.5">
                                                                {transaction.plan.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="font-poppins-600 text-sm text-[#121212]">
                                                            {formatPrice(transaction.amount, transaction.currency)}
                                                        </p>
                                                        <p className={`font-poppins-600 text-xs ${getStatusColor(transaction.status)} mt-1`}>
                                                            {getStatusText(transaction.status)}
                                                        </p>
                                                    </div>
                                                </div>
                                                {transaction.stripeInvoiceId && (
                                                    <p className="font-poppins-400 text-xs text-[#484848] mt-2 truncate">
                                                        Invoice: {transaction.stripeInvoiceId}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <BottomNav activeTab="home" />
        </div>
    );
}
