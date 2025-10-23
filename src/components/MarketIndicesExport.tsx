/**
 * Market Indices Export Component
 * Provides UI to generate and download portfolio data enhanced with market indices
 */

 import React, { useState } from 'react';
 import { Download, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Alert, AlertDescription } from '@/components/ui/alert';
 import { Progress } from '@/components/ui/progress';
 import { processDefaultPortfolioSnapshot, downloadCSV } from '@/utils/csvProcessor';
 import { INDEX_SYMBOLS } from '@/utils/marketIndicesService';
 
 interface MarketIndicesExportProps {
   className?: string;
 }
 
 export const MarketIndicesExport: React.FC<MarketIndicesExportProps> = ({ className }) => {
   const [isGenerating, setIsGenerating] = useState(false);
   const [progress, setProgress] = useState(0);
   const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
   const [errorMessage, setErrorMessage] = useState<string>('');
   const [lastGeneratedAt, setLastGeneratedAt] = useState<Date | null>(null);
 
   const handleGenerateExport = async () => {
     try {
       setIsGenerating(true);
       setStatus('generating');
       setErrorMessage('');
       setProgress(0);
 
       // Update progress as we start fetching data
       setProgress(10);
       
       // Process the default portfolio snapshot (this will fetch real market data)
       setProgress(30);
       const enhancedCSV = await processDefaultPortfolioSnapshot();
       
       setProgress(90);
 
       // Download the enhanced CSV
       downloadCSV(enhancedCSV, 'portfolio_indices_snapshot.csv');
       
       setProgress(100);
       setStatus('success');
       setLastGeneratedAt(new Date());
 
     } catch (error) {
       console.error('Error generating enhanced portfolio export:', error);
       setStatus('error');
       setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
     } finally {
       setIsGenerating(false);
       // Reset progress after a delay
       setTimeout(() => {
         setProgress(0);
         if (status === 'success') setStatus('idle');
       }, 3000);
     }
   };
 
   const getStatusIcon = () => {
     switch (status) {
       case 'generating':
         return <TrendingUp className="h-4 w-4 animate-spin" />;
       case 'success':
         return <CheckCircle className="h-4 w-4 text-green-500" />;
       case 'error':
         return <AlertCircle className="h-4 w-4 text-red-500" />;
       default:
         return <Download className="h-4 w-4" />;
     }
   };
 
   const getStatusMessage = () => {
     switch (status) {
       case 'generating':
         return 'Fetching market indices data and generating enhanced portfolio...';
       case 'success':
         return `Successfully generated portfolio_indices_snapshot.csv at ${lastGeneratedAt?.toLocaleTimeString()}`;
       case 'error':
         return `Error: ${errorMessage}`;
       default:
         return '';
     }
   };
 
   return (
     <Card className={className}>
       <CardHeader>
         <CardTitle className="flex items-center gap-2">
           <TrendingUp className="h-5 w-5" />
           Market Indices Export
         </CardTitle>
         <CardDescription>
           Generate an enhanced portfolio CSV file that includes real historical market indices data 
           from Yahoo Finance for comparative analysis.
         </CardDescription>
       </CardHeader>
       <CardContent className="space-y-4">
         <div className="grid grid-cols-2 gap-4 text-sm">
           <div>
             <h4 className="font-semibold mb-2">Included Indices:</h4>
             <ul className="space-y-1 text-muted-foreground">
               {INDEX_SYMBOLS.map((index) => (
                 <li key={index.symbol} className="flex items-center gap-2">
                   <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                   {index.name}
                 </li>
               ))}
             </ul>
           </div>
           <div>
             <h4 className="font-semibold mb-2">Export Features:</h4>
             <ul className="space-y-1 text-muted-foreground">
               <li className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                 Historical data alignment
               </li>
               <li className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                 Date-matched indices values
               </li>
               <li className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                 CSV format preservation
               </li>
               <li className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                 Ready for analysis tools
               </li>
             </ul>
           </div>
         </div>
 
         {status !== 'idle' && (
           <Alert className={status === 'error' ? 'border-red-200 bg-red-50' : 
                            status === 'success' ? 'border-green-200 bg-green-50' : 
                            'border-blue-200 bg-blue-50'}>
             <div className="flex items-center gap-2">
               {getStatusIcon()}
               <AlertDescription>{getStatusMessage()}</AlertDescription>
             </div>
           </Alert>
         )}
 
         {isGenerating && (
           <div className="space-y-2">
             <div className="flex justify-between text-sm">
               <span>Progress</span>
               <span>{progress}%</span>
             </div>
             <Progress value={progress} className="w-full" />
           </div>
         )}
 
         <div className="flex gap-3">
           <Button 
             onClick={handleGenerateExport} 
             disabled={isGenerating}
             className="flex-1"
           >
             {getStatusIcon()}
             {isGenerating ? 'Generating...' : 'Generate & Download Enhanced Portfolio'}
           </Button>
         </div>
 
         <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
           <p className="font-semibold mb-1">Note:</p>
           <p>
             The generated file will include all original portfolio data plus real market indices values 
             for each date. Data is fetched from Yahoo Finance API and aligned with your portfolio dates 
             for accurate comparative analysis. If market data is not available for specific dates (e.g., 
             weekends/holidays), the closest previous trading day value is used.
           </p>
         </div>
       </CardContent>
     </Card>
   );
 };